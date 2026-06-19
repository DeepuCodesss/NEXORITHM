import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

const getReplayMetrics = (replayData: unknown) => {
  const data = replayData as { stats?: { pastedCharacters?: number }; events?: Array<{ type?: string; code?: string; charsInserted?: number }> } | null;
  const events = data?.events ?? [];
  const lastSnapshot = [...events].reverse().find((event) => event.type === "snapshot" && typeof event.code === "string");
  const pastedCharacters = Number(data?.stats?.pastedCharacters ?? 0);
  const finalCodeLength = Number(lastSnapshot?.code?.length ?? 0);
  const pasteContribution = finalCodeLength > 0 ? Math.max(0, Math.min(100, Math.round((pastedCharacters / finalCodeLength) * 100))) : 0;
  const largeInsertCount = events.filter((event) => event.type === "large_insert").length;
  return {
    pasteContribution,
    largeInsertCount,
  };
};

export async function GET(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) return apiError("Admin access required.", 403);
  if (!isAdmin(clerkUser)) return apiError("Admin access required.", 403);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(10, Number(searchParams.get("pageSize") ?? 20)));
  const skip = (page - 1) * pageSize;
  const sort = searchParams.get("sort") ?? "newest";

  const prisma = getPrisma();
  const [total, replays] = await Promise.all([
    prisma.solutionReplay.count(),
    prisma.solutionReplay.findMany({
      select: {
        id: true,
        solveTimeSeconds: true,
        trustScore: true,
        replayData: true,
        language: true,
        pasteCount: true,
        pastedCharacters: true,
        runCount: true,
        tabSwitchCount: true,
        createdAt: true,
        user: { select: { username: true, fullName: true } },
        problem: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const ranked = replays
    .map((replay) => {
      const metrics = getReplayMetrics(replay.replayData);
      return {
        ...replay,
        pasteContribution: metrics.pasteContribution,
        largeInsertCount: metrics.largeInsertCount,
      };
    })
    .sort((a, b) => {
      if (sort === "lowest_trust") return a.trustScore - b.trustScore || b.createdAt.getTime() - a.createdAt.getTime();
      if (sort === "highest_paste") return b.pasteContribution - a.pasteContribution || b.createdAt.getTime() - a.createdAt.getTime();
      if (sort === "most_tab_switches") return b.tabSwitchCount - a.tabSwitchCount || b.createdAt.getTime() - a.createdAt.getTime();
      if (sort === "most_large_insertions") return b.largeInsertCount - a.largeInsertCount || b.createdAt.getTime() - a.createdAt.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const paged = ranked.slice(skip, skip + pageSize);

  return apiSuccess({
    replays: paged,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
