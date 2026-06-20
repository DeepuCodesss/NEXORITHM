import { getPrisma } from "@/lib/db";
import { judgeSubmission } from "@/lib/judge";
import { isJudgeLanguage } from "@/lib/languages";
import { MOCK_PROBLEMS } from "@/lib/mockData";
import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";
import { checkRateLimit } from "@/lib/rateLimit";
import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "crypto";
import { apiError } from "@/lib/apiResponse";
import { apiSuccess } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import { calculateTrustScore, normalizeReplayEvents, type ReplayPayload } from "@/lib/replay";
import { ensureJudgeBootstrapLogged } from "@/lib/judgeBootstrap";

export const runtime = "nodejs";

const IST_TIME_ZONE = "Asia/Kolkata";

const getDateKeyInTimeZone = (value: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);

const getStreakReward = (streakDay: number) => {
  if (streakDay <= 0) return { coins: 0, cash: 0 };
  if (streakDay <= 2) return { coins: 5, cash: 0 };
  if (streakDay <= 4) return { coins: 10, cash: 0 };
  if (streakDay === 5) return { coins: 15, cash: 0 };
  if (streakDay === 6) return { coins: 20, cash: 0 };
  return { coins: 50, cash: 5 };
};

export async function POST(request: Request) {
  const requestStartedAt = Date.now();
  await ensureJudgeBootstrapLogged();
  const body = await request.json().catch(() => null);
  const problemId = typeof body?.problemId === "string" ? body.problemId : "";
  const language = body?.language;
  const code = typeof body?.code === "string" ? body.code : "";
  const replayPayload = body?.replay as ReplayPayload | undefined;
  const problem = MOCK_PROBLEMS.find((item) => item.id === problemId);

  if (!problem) {
    return apiError("Problem not found.", 404);
  }

  if (!code.trim()) {
    return apiError("Code is required.", 400);
  }

  if (!isJudgeLanguage(language)) {
    return apiError("Unsupported language.", 400);
  }

  logger.info("submission.request_received", {
    route: "/api/submissions",
    language,
    problemId,
  });

  const judgeStartedAt = Date.now();
  const result = await judgeSubmission(problem, language, code);
  logger.info("submission.judge_duration", {
    route: "/api/submissions",
    language,
    problemId,
    durationMs: Date.now() - judgeStartedAt,
  });
  let submissionId: string | null = null;
  let saved = false;
  let databaseError: string | null = null;
  const clerkUser = await currentUser();

  if (!clerkUser) {
    logger.warn("auth.failure", { route: "/api/submissions", reason: "missing_user" });
    return apiError("Authentication required.", 401);
  }

  const rateLimit = await checkRateLimit(`submit:${clerkUser.id}`);
  if (!rateLimit.allowed) {
    return apiError("Rate limit exceeded.", 429);
  }

  try {
    const dbStartedAt = Date.now();
    const prisma = getPrisma();
    const user = await upsertClerkUser(clerkUser);

    await prisma.problem.upsert({
      where: { id: problem.id },
      update: {
        title: problem.title,
        difficulty: problem.difficulty,
        level: problem.level,
        topic: problem.topic,
        pattern: problem.pattern,
        judgeKind: problem.judge.kind,
        xpReward: problem.xpReward,
        coinReward: problem.coinReward,
        prizeMoneyInr: null,
        description: problem.description,
        starterCode: problem.starterCode,
        testCases: problem.testCases,
      },
      create: {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        level: problem.level,
        topic: problem.topic,
        pattern: problem.pattern,
        judgeKind: problem.judge.kind,
        xpReward: problem.xpReward,
        coinReward: problem.coinReward,
        prizeMoneyInr: null,
        description: problem.description,
        starterCode: problem.starterCode,
        testCases: problem.testCases,
      },
    });

    const now = new Date();
    const submissionResult = await prisma.$transaction(async (tx) => {
      const lockedUsers = await tx.$queryRaw<Array<{
        id: string;
        xp: number;
        coins: number;
        moneyEarnedInr: number;
        reputation: number;
        currentStreak: number;
        longestStreak: number;
        solvedProblemIds: unknown;
        lastSolvedAt: Date | null;
      }>>`SELECT "id", "xp", "coins", "moneyEarnedInr", "reputation", "currentStreak", "longestStreak", "solvedProblemIds", "lastSolvedAt"
        FROM "User" WHERE "id" = ${user.id} LIMIT 1 FOR UPDATE`;
      const lockedUser = lockedUsers[0];
      if (!lockedUser) {
        throw new Error("User record not found.");
      }

      const createdSubmission = await tx.submission.create({
        data: {
          problemId: problem.id,
          userId: user.id,
          language,
          code,
          status: result.status,
          passedCount: result.passedCount,
          totalCount: result.totalCount,
          runtimeMs: result.runtimeMs,
          output: JSON.parse(JSON.stringify({ cases: result.cases })),
        },
      });

      if (result.status !== "Accepted") {
        return { createdSubmission };
      }

      const currentSolvedProblemIds = Array.isArray(lockedUser.solvedProblemIds)
        ? lockedUser.solvedProblemIds.filter((value): value is string => typeof value === "string")
        : [];
      if (currentSolvedProblemIds.includes(problem.id)) {
        return { createdSubmission };
      }

      const lastSolvedAt = lockedUser.lastSolvedAt ? new Date(lockedUser.lastSolvedAt) : null;
      const currentDayKey = getDateKeyInTimeZone(now, IST_TIME_ZONE);
      const lastDayKey = lastSolvedAt ? getDateKeyInTimeZone(lastSolvedAt, IST_TIME_ZONE) : null;
      const previousDay = lastSolvedAt ? new Date(lastSolvedAt) : null;
      if (previousDay) {
        previousDay.setDate(previousDay.getDate() + 1);
      }
      const previousDayKey = previousDay ? getDateKeyInTimeZone(previousDay, IST_TIME_ZONE) : null;

      const nextStreak =
        !lastDayKey || lastDayKey === currentDayKey
          ? Math.max(lockedUser.currentStreak, 1)
          : lastDayKey === previousDayKey
            ? lockedUser.currentStreak + 1
            : 1;
      const streakReward = getStreakReward(nextStreak);
      const xpReward = problem.xpReward;
      const coinReward = problem.coinReward;
      const activeLiveReward = await tx.$queryRaw<Array<{ id: string; rewardMoney: number }>>(
        Prisma.sql`SELECT "id", "rewardMoney" FROM "LiveReward"
          WHERE "problemId" = ${problem.id}
            AND "isActive" = true
            AND "startsAt" <= ${now}
            AND "endsAt" > ${now}
            AND "winnerUserId" IS NULL
          ORDER BY "createdAt" DESC
          LIMIT 1`,
      );
      const liveReward = activeLiveReward[0] ?? null;
      if (liveReward) {
        const claimResult = await tx.$executeRaw(
          Prisma.sql`UPDATE "LiveReward"
          SET "winnerUserId" = ${user.id},
              "winnerSubmissionId" = ${createdSubmission.id},
              "paidAt" = ${now},
              "isActive" = 0
          WHERE "id" = ${liveReward.id} AND "winnerUserId" IS NULL`,
        );
        if (claimResult === 0) {
          return { createdSubmission };
        }
      }
      const cashReward = streakReward.cash + Number(liveReward?.rewardMoney ?? 0);
      const reputationReward = Math.max(5, Math.floor(xpReward / 10));
      const nextXp = lockedUser.xp + xpReward;
      const nextCoins = lockedUser.coins + coinReward + streakReward.coins;
      const nextCash = lockedUser.moneyEarnedInr + cashReward;

      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: nextXp,
          coins: nextCoins,
          moneyEarnedInr: nextCash,
          reputation: lockedUser.reputation + reputationReward,
          devRank: Math.floor(nextXp / 200),
          currentStreak: nextStreak,
          longestStreak: Math.max(lockedUser.longestStreak, nextStreak),
          solvedProblemIds: [...currentSolvedProblemIds, problem.id],
          lastSolvedAt: now,
        },
      });

      await tx.$executeRaw(
        Prisma.sql`INSERT INTO "RewardTransaction" ("id", "userId", "type", "source", "amount", "metadata", "createdAt")
        VALUES (${randomUUID()}, ${user.id}, ${"xp"}, ${"problem_solve"}, ${xpReward}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id })}, ${now})`,
      );
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO "RewardTransaction" ("id", "userId", "type", "source", "amount", "metadata", "createdAt")
        VALUES (${randomUUID()}, ${user.id}, ${"coins"}, ${"problem_solve"}, ${coinReward}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id })}, ${now})`,
      );
      if (streakReward.coins > 0) {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO "RewardTransaction" ("id", "userId", "type", "source", "amount", "metadata", "createdAt")
          VALUES (${randomUUID()}, ${user.id}, ${"coins"}, ${"streak_reward"}, ${streakReward.coins}, ${JSON.stringify({ streakDay: nextStreak, problemId: problem.id })}, ${now})`,
        );
      }
      if (streakReward.cash > 0) {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO "RewardTransaction" ("id", "userId", "type", "source", "amount", "metadata", "createdAt")
          VALUES (${randomUUID()}, ${user.id}, ${"cash"}, ${"streak_reward"}, ${streakReward.cash}, ${JSON.stringify({ streakDay: nextStreak, problemId: problem.id })}, ${now})`,
        );
      }
      if (cashReward > 0) {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO "RewardTransaction" ("id", "userId", "type", "source", "amount", "metadata", "createdAt")
          VALUES (${randomUUID()}, ${user.id}, ${"cash"}, ${"problem_cash_reward"}, ${cashReward}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id })}, ${now})`,
        );
      }

      if (liveReward) {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO "RewardTransaction" ("id", "userId", "type", "source", "amount", "metadata", "createdAt")
          VALUES (${randomUUID()}, ${user.id}, ${"cash"}, ${"live_reward"}, ${Number(liveReward.rewardMoney ?? 0)}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id, liveRewardId: liveReward.id })}, ${now})`,
        );
      }

      return { createdSubmission };
    });

    submissionId = submissionResult.createdSubmission.id;
    saved = true;
    if (result.status === "Accepted" && replayPayload?.events && Array.isArray(replayPayload.events) && replayPayload.stats) {
      void (async () => {
        try {
          const prisma = getPrisma();
          const compactEvents = normalizeReplayEvents(replayPayload.events).slice(0, 60);
          const trustScore = calculateTrustScore(
            {
              pasteCount: replayPayload.stats.pasteCount,
              pastedCharacters: replayPayload.stats.pastedCharacters,
              largeInsertCount: replayPayload.stats.largeInsertCount,
              runCount: replayPayload.stats.runCount,
              tabSwitchCount: replayPayload.stats.tabSwitchCount,
              solveTimeSeconds: Math.max(1, replayPayload.stats.solveTimeSeconds),
            },
            compactEvents,
          );
          console.log("[replay] replay payload stored in database", {
            userId: user.id,
            problemId: problem.id,
            submissionId,
            eventCount: compactEvents.length,
            pasteCount: replayPayload.stats.pasteCount,
            pastedCharacters: replayPayload.stats.pastedCharacters,
          });
          await prisma.solutionReplay.upsert({
            where: {
              userId_problemId: {
                userId: user.id,
                problemId: problem.id,
              },
            },
            update: {
              submissionId,
              language,
              replayData: JSON.parse(
                JSON.stringify({
                  events: compactEvents,
                  stats: {
                    ...replayPayload.stats,
                    solveTimeSeconds: Math.max(1, replayPayload.stats.solveTimeSeconds),
                    trustScore,
                  },
                }),
              ),
              solveTimeSeconds: Math.max(1, replayPayload.stats.solveTimeSeconds),
              pasteCount: replayPayload.stats.pasteCount,
              pastedCharacters: replayPayload.stats.pastedCharacters,
              runCount: replayPayload.stats.runCount,
              tabSwitchCount: replayPayload.stats.tabSwitchCount,
            },
            create: {
              userId: user.id,
              problemId: problem.id,
              submissionId,
              language,
              replayData: JSON.parse(
                JSON.stringify({
                  events: compactEvents,
                  stats: {
                    ...replayPayload.stats,
                    solveTimeSeconds: Math.max(1, replayPayload.stats.solveTimeSeconds),
                    trustScore,
                  },
                }),
              ),
              solveTimeSeconds: Math.max(1, replayPayload.stats.solveTimeSeconds),
              pasteCount: replayPayload.stats.pasteCount,
              pastedCharacters: replayPayload.stats.pastedCharacters,
              runCount: replayPayload.stats.runCount,
              tabSwitchCount: replayPayload.stats.tabSwitchCount,
            },
          });
        } catch (error) {
          logger.warn("replay.save_failed", {
            userId: user.id,
            problemId: problem.id,
            submissionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })();
    }
    logger.info("submission.saved", {
      userId: user.id,
      problemId: problem.id,
      submissionId,
      status: result.status,
    });
    logger.info("submission.database_duration", {
      route: "/api/submissions",
      language,
      problemId: problem.id,
      durationMs: Date.now() - dbStartedAt,
    });
  } catch (error) {
    databaseError = error instanceof Error ? error.message : String(error);
    logger.error("submission.failed", {
      userId: clerkUser.id,
      problemId: problem.id,
      error: databaseError,
    });
  }

  logger.info("submission.total_duration", {
    route: "/api/submissions",
    language,
    problemId: problem.id,
    durationMs: Date.now() - requestStartedAt,
  });

  return apiSuccess({
    problemId: problem.id,
    submissionId,
    saved,
    databaseError,
    ...result,
  });
}
