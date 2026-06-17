import { getPrisma } from "@/lib/db";
import { judgeSubmission } from "@/lib/judge";
import { isJudgeLanguage } from "@/lib/languages";
import { MOCK_PROBLEMS } from "@/lib/mockData";
import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";
import { checkRateLimit } from "@/lib/rateLimit";
import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "crypto";

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
  const body = await request.json().catch(() => null);
  const problemId = typeof body?.problemId === "string" ? body.problemId : "";
  const language = body?.language;
  const code = typeof body?.code === "string" ? body.code : "";
  const problem = MOCK_PROBLEMS.find((item) => item.id === problemId);

  if (!problem) {
    return Response.json({ error: "Problem not found." }, { status: 404 });
  }

  if (!code.trim()) {
    return Response.json({ error: "Code is required." }, { status: 400 });
  }

  if (!isJudgeLanguage(language)) {
    return Response.json({ error: "Unsupported language." }, { status: 400 });
  }

  const result = await judgeSubmission(problem, language, code);
  let submissionId: string | null = null;
  let saved = false;
  let databaseError: string | null = null;
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`submit:${clerkUser.id}`);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  try {
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
        prizeMoneyInr: problem.prizeMoneyInr,
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
        prizeMoneyInr: problem.prizeMoneyInr,
        description: problem.description,
        starterCode: problem.starterCode,
        testCases: problem.testCases,
      },
    });

    const now = new Date();
    const submissionResult = await prisma.$transaction(async (tx) => {
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

      const currentSolvedProblemIds = Array.isArray(user.solvedProblemIds)
        ? user.solvedProblemIds.filter((value): value is string => typeof value === "string")
        : [];
      if (currentSolvedProblemIds.includes(problem.id)) {
        return { createdSubmission };
      }

      const lastSolvedAt = user.lastSolvedAt ? new Date(user.lastSolvedAt) : null;
      const currentDayKey = getDateKeyInTimeZone(now, IST_TIME_ZONE);
      const lastDayKey = lastSolvedAt ? getDateKeyInTimeZone(lastSolvedAt, IST_TIME_ZONE) : null;
      const previousDay = lastSolvedAt ? new Date(lastSolvedAt) : null;
      if (previousDay) {
        previousDay.setDate(previousDay.getDate() + 1);
      }
      const previousDayKey = previousDay ? getDateKeyInTimeZone(previousDay, IST_TIME_ZONE) : null;

      const nextStreak =
        !lastDayKey || lastDayKey === currentDayKey
          ? Math.max(user.currentStreak, 1)
          : lastDayKey === previousDayKey
            ? user.currentStreak + 1
            : 1;
      const streakReward = getStreakReward(nextStreak);
      const xpReward = problem.xpReward;
      const coinReward = problem.coinReward;
      const activeLiveReward = await tx.$queryRaw<Array<{ id: string; rewardMoney: number }>>(
        Prisma.sql`SELECT id, rewardMoney FROM LiveReward
          WHERE problemId = ${problem.id}
            AND isActive = 1
            AND startsAt <= ${now}
            AND endsAt > ${now}
            AND winnerUserId IS NULL
          ORDER BY createdAt DESC
          LIMIT 1`,
      );
      const liveReward = activeLiveReward[0] ?? null;
      const cashReward = (problem.prizeMoneyInr ?? 0) + streakReward.cash + Number(liveReward?.rewardMoney ?? 0);
      const reputationReward = Math.max(5, Math.floor(xpReward / 10));
      const nextXp = user.xp + xpReward;
      const nextCoins = user.coins + coinReward + streakReward.coins;
      const nextCash = user.moneyEarnedInr + cashReward;

      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: nextXp,
          coins: nextCoins,
          moneyEarnedInr: nextCash,
          reputation: user.reputation + reputationReward,
          devRank: Math.floor(nextXp / 200),
          currentStreak: nextStreak,
          longestStreak: Math.max(user.longestStreak, nextStreak),
          solvedProblemIds: [...currentSolvedProblemIds, problem.id],
          lastSolvedAt: now,
        },
      });

      await tx.$executeRaw(
        Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
        VALUES (${randomUUID()}, ${user.id}, ${"xp"}, ${"problem_solve"}, ${xpReward}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id })}, ${now})`,
      );
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
        VALUES (${randomUUID()}, ${user.id}, ${"coins"}, ${"problem_solve"}, ${coinReward}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id })}, ${now})`,
      );
      if (streakReward.coins > 0) {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
          VALUES (${randomUUID()}, ${user.id}, ${"coins"}, ${"streak_reward"}, ${streakReward.coins}, ${JSON.stringify({ streakDay: nextStreak, problemId: problem.id })}, ${now})`,
        );
      }
      if (streakReward.cash > 0) {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
          VALUES (${randomUUID()}, ${user.id}, ${"cash"}, ${"streak_reward"}, ${streakReward.cash}, ${JSON.stringify({ streakDay: nextStreak, problemId: problem.id })}, ${now})`,
        );
      }
      if (cashReward > 0) {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
          VALUES (${randomUUID()}, ${user.id}, ${"cash"}, ${"problem_cash_reward"}, ${cashReward}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id })}, ${now})`,
        );
      }

      if (liveReward) {
        await tx.$executeRaw(
          Prisma.sql`UPDATE LiveReward
          SET winnerUserId = ${user.id},
              winnerSubmissionId = ${createdSubmission.id},
              paidAt = ${now},
              isActive = 0
          WHERE id = ${liveReward.id} AND winnerUserId IS NULL`,
        );
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
          VALUES (${randomUUID()}, ${user.id}, ${"cash"}, ${"live_reward"}, ${Number(liveReward.rewardMoney ?? 0)}, ${JSON.stringify({ problemId: problem.id, submissionId: createdSubmission.id, liveRewardId: liveReward.id })}, ${now})`,
        );
      }

      return { createdSubmission };
    });

    submissionId = submissionResult.createdSubmission.id;
    saved = true;
  } catch (error) {
    databaseError = error instanceof Error ? error.message : String(error);
  }

  return Response.json({
    problemId: problem.id,
    submissionId,
    saved,
    databaseError,
    ...result,
  });
}
