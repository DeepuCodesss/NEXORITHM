import { getPrisma } from "@/lib/db";
import { apiError } from "@/lib/apiResponse";
import { apiSuccess } from "@/lib/apiResponse";
import { getUserCashBalanceInr } from "@/lib/rewards";
import { getEffectiveCurrentStreak } from "@/lib/streak";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return apiError("Profile not found.", 404);
  }

  const leaderboard = await prisma.user.findMany();
  const ranked = leaderboard
    .map((entry) => ({
      ...entry,
      effectiveCurrentStreak: getEffectiveCurrentStreak(entry.currentStreak, entry.lastSolvedAt),
      solvedCount: Array.isArray(entry.solvedProblemIds) ? entry.solvedProblemIds.length : 0,
      lastSolvedTs: entry.lastSolvedAt ? new Date(entry.lastSolvedAt).getTime() : 0,
    }))
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
      if (b.effectiveCurrentStreak !== a.effectiveCurrentStreak) return b.effectiveCurrentStreak - a.effectiveCurrentStreak;
      if (a.lastSolvedTs !== b.lastSolvedTs) return a.lastSolvedTs - b.lastSolvedTs;
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });

  const rank = ranked.findIndex((entry) => entry.id === user.id) + 1;
  const solvedProblemIds = Array.isArray(user.solvedProblemIds) ? user.solvedProblemIds : [];
  const effectiveCurrentStreak = getEffectiveCurrentStreak(user.currentStreak, user.lastSolvedAt);
  const moneyEarnedInr = await getUserCashBalanceInr(user.id);
  const recentActivity = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { problem: { select: { title: true, slug: true } } },
  });
  const badges = [
    { id: "first-solve", label: "First Solve", active: solvedProblemIds.length > 0 },
    { id: "streak-7", label: "7 Day Streak", active: effectiveCurrentStreak >= 7 },
    { id: "xp-500", label: "500 XP", active: user.xp >= 500 },
  ];

  return apiSuccess({
    profile: {
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      coins: user.coins,
      moneyEarnedInr,
      currentStreak: effectiveCurrentStreak,
      solvedCount: solvedProblemIds.length,
      globalRank: rank,
      college: user.college,
      joinedDate: user.createdAt.toISOString(),
      recentActivity: recentActivity.map((item) => ({
        id: item.id,
        status: item.status,
        problemTitle: item.problem.title,
        problemSlug: item.problem.slug,
        createdAt: item.createdAt.toISOString(),
      })),
      badges,
    },
  });
}
