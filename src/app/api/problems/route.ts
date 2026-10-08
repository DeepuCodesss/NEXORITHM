import { getPrisma } from "@/lib/db";
import { apiSuccess } from "@/lib/apiResponse";
import { ensureProblemCatalog, toProblemSummary } from "@/lib/problemCatalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await ensureProblemCatalog();
  const prisma = getPrisma();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(4500, Math.max(10, Number(searchParams.get("pageSize") ?? 80) || 80));
  const query = searchParams.get("query")?.trim() ?? "";
  const difficulty = searchParams.get("difficulty");
  const topic = searchParams.get("topic")?.trim() ?? "";
  const filters = [
    query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { topic: { contains: query, mode: "insensitive" as const } },
            { pattern: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : null,
    difficulty && difficulty !== "All" ? { difficulty } : null,
    topic
      ? {
          OR: [
            { topic: { contains: topic, mode: "insensitive" as const } },
            { pattern: { contains: topic, mode: "insensitive" as const } },
          ],
        }
      : null,
  ].filter((filter): filter is NonNullable<typeof filter> => filter !== null);
  const where = filters.length > 0 ? { AND: filters } : undefined;
  const skip = (page - 1) * pageSize;
  const [total, storedProblems] = await Promise.all([
    prisma.problem.count({ where }),
    prisma.problem.findMany({
      where,
      orderBy: { level: "asc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        level: true,
        topic: true,
        pattern: true,
        xpReward: true,
        coinReward: true,
      },
    }),
  ]);

  const response = apiSuccess({
    problems: storedProblems.map(toProblemSummary),
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
  response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  return response;
}
