import "server-only";

import { getPrisma } from "@/lib/db";
import { MOCK_PROBLEMS, type Problem, type ProblemSummary } from "@/lib/mockData";

let catalogSync: Promise<void> | null = null;

const toDatabaseProblem = (problem: (typeof MOCK_PROBLEMS)[number]) => ({
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
  prizeMoneyInr: problem.prizeMoneyInr ?? null,
  description: problem.description,
  starterCode: problem.starterCode,
  testCases: problem.testCases,
});

export const ensureProblemCatalog = async () => {
  if (!catalogSync) {
    catalogSync = (async () => {
      const prisma = getPrisma();
      const existing = await prisma.problem.findMany({ select: { id: true } });
      const existingIds = new Set(existing.map((problem) => problem.id));
      const missing = MOCK_PROBLEMS.filter((problem) => !existingIds.has(problem.id));

      if (missing.length > 0) {
        await prisma.problem.createMany({
          data: missing.map(toDatabaseProblem),
          skipDuplicates: true,
        });
      }
    })().catch((error) => {
      catalogSync = null;
      throw error;
    });
  }

  await catalogSync;
};

export const toProblemSummary = (problem: {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  level: number;
  topic: string;
  pattern: string;
  xpReward: number;
  coinReward: number;
}): ProblemSummary => ({
  id: problem.id,
  title: problem.title,
  slug: problem.slug,
  difficulty: problem.difficulty as ProblemSummary["difficulty"],
  level: problem.level,
  topic: problem.topic,
  pattern: problem.pattern,
  xpReward: problem.xpReward,
  coinReward: problem.coinReward,
});

export const getProblemFromDatabase = async (problemId: string) => {
  await ensureProblemCatalog();
  const prisma = getPrisma();
  const stored = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!stored) return null;

  const template = MOCK_PROBLEMS.find((problem) => problem.id === stored.id);
  if (!template) return null;

  return {
    ...template,
    id: stored.id,
    slug: stored.slug,
    title: stored.title,
    difficulty: stored.difficulty as Problem["difficulty"],
    level: stored.level,
    topic: stored.topic,
    pattern: stored.pattern,
    xpReward: stored.xpReward,
    coinReward: stored.coinReward,
    prizeMoneyInr: stored.prizeMoneyInr ?? undefined,
    description: stored.description,
    starterCode: stored.starterCode as Problem["starterCode"],
    testCases: stored.testCases as Problem["testCases"],
  } satisfies Problem;
};
