import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({
    orderBy: [{ xp: "desc" }, { currentStreak: "desc" }, { updatedAt: "asc" }],
  });

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    xp: user.xp,
    college: user.college,
    streak: user.currentStreak,
    solvedCount: Array.isArray(user.solvedProblemIds) ? user.solvedProblemIds.length : 0,
    isPro: user.isPro,
    devRank: user.devRank || Math.floor(user.xp / 200),
  }));

  return Response.json({ leaderboard });
}

