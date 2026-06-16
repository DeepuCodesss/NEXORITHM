import { getPrisma } from "@/lib/db";
import { judgeSubmission } from "@/lib/judge";
import { isJudgeLanguage } from "@/lib/languages";
import { MOCK_PROBLEMS } from "@/lib/mockData";
import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";

export const runtime = "nodejs";

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

  try {
    const prisma = getPrisma();
    const user = clerkUser ? await upsertClerkUser(clerkUser) : null;

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

    const submission = await prisma.submission.create({
      data: {
        problemId: problem.id,
        userId: user?.id,
        language,
        code,
        status: result.status,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        runtimeMs: result.runtimeMs,
        output: JSON.parse(JSON.stringify({ cases: result.cases })),
      },
    });
    submissionId = submission.id;
    saved = true;

    if (user && result.status === "Accepted") {
      const solvedProblemIds = Array.isArray(user.solvedProblemIds) ? user.solvedProblemIds : [];
      if (!solvedProblemIds.includes(problem.id)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            xp: user.xp + problem.xpReward,
            coins: user.coins + problem.coinReward,
            moneyEarnedInr: user.moneyEarnedInr + (problem.prizeMoneyInr ?? 0),
            reputation: user.reputation + Math.max(5, Math.floor(problem.xpReward / 10)),
            devRank: Math.floor((user.xp + problem.xpReward) / 200),
            currentStreak: user.currentStreak === 0 ? 1 : user.currentStreak,
            longestStreak: Math.max(user.longestStreak, user.currentStreak === 0 ? 1 : user.currentStreak),
            solvedProblemIds: [...solvedProblemIds, problem.id],
            lastSolvedAt: new Date(),
          },
        });
      }
    }
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
