import { getPrisma } from "@/lib/db";
import { apiSuccess } from "@/lib/apiResponse";
import { calculatePasteContribution } from "@/lib/replay";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(10, Number(searchParams.get("pageSize") ?? 10)));
  const skip = (page - 1) * pageSize;

  const prisma = getPrisma();
  const [total, replays] = await Promise.all([
    prisma.solutionReplay.count({ where: { problemId } }),
    prisma.solutionReplay.findMany({
      where: { problemId },
      orderBy: [{ solveTimeSeconds: "asc" }, { createdAt: "asc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        user: { select: { username: true, fullName: true, avatarUrl: true } },
        solveTimeSeconds: true,
        trustScore: true,
        replayData: true,
        language: true,
        createdAt: true,
      },
    }),
  ]);

  const leaders = replays.map((replay, index) => {
    const replayData = replay.replayData as { stats?: { pastedCharacters?: number }; events?: Array<{ type: string; code?: string }> } | null;
    const lastSnapshot = [...(replayData?.events ?? [])].reverse().find((event) => event.type === "snapshot" && typeof event.code === "string");
    return {
      rank: skip + index + 1,
      user: replay.user.fullName || replay.user.username,
      username: replay.user.username,
      avatarUrl: replay.user.avatarUrl,
      solveTime: replay.solveTimeSeconds,
      trustScore: replay.trustScore,
      language: replay.language,
      replayId: replay.id,
      pasteContribution: calculatePasteContribution(Number(replayData?.stats?.pastedCharacters ?? 0), Number(lastSnapshot?.code?.length ?? 0)),
    };
  });

  return apiSuccess({
    leaders,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
