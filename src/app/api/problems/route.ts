import { NextResponse } from "next/server";
import { MOCK_PROBLEMS, type ProblemSummary } from "@/lib/mockData";

export const runtime = "nodejs";

const toSummary = (problem: (typeof MOCK_PROBLEMS)[number]): ProblemSummary => ({
  id: problem.id,
  title: problem.title,
  slug: problem.slug,
  difficulty: problem.difficulty,
  level: problem.level,
  topic: problem.topic,
  pattern: problem.pattern,
  xpReward: problem.xpReward,
  coinReward: problem.coinReward,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(4500, Math.max(10, Number(searchParams.get("pageSize") ?? 80)));
  const query = searchParams.get("query")?.trim().toLowerCase() ?? "";
  const difficulty = searchParams.get("difficulty");
  const topic = searchParams.get("topic")?.trim().toLowerCase() ?? "";

  const filtered = MOCK_PROBLEMS.filter((problem) => {
    const matchesQuery = !query || [problem.title, problem.topic, problem.pattern].some((value) => value.toLowerCase().includes(query));
    const matchesDifficulty = !difficulty || difficulty === "All" || problem.difficulty === difficulty;
    const matchesTopic = !topic || problem.topic.toLowerCase().includes(topic) || problem.pattern.toLowerCase().includes(topic);
    return matchesQuery && matchesDifficulty && matchesTopic;
  });
  const start = (page - 1) * pageSize;
  const problems = filtered.slice(start, start + pageSize).map(toSummary);

  return NextResponse.json(
    {
      success: true,
      data: {
        problems,
        pagination: {
          page,
          pageSize,
          total: filtered.length,
          pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        },
      },
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
