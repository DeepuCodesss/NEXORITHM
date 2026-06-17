import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({
  });

  const leaderboard = users
    .map((user) => ({
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      college: user.college,
      streak: user.currentStreak,
      solvedCount: Array.isArray(user.solvedProblemIds) ? user.solvedProblemIds.length : 0,
      isPro: user.isPro,
      devRank: user.devRank || Math.floor(user.xp / 200),
      lastSolvedAt: user.lastSolvedAt ? new Date(user.lastSolvedAt).getTime() : 0,
      updatedAt: new Date(user.updatedAt).getTime(),
    }))
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
      if (b.streak !== a.streak) return b.streak - a.streak;
      if (a.lastSolvedAt !== b.lastSolvedAt) return a.lastSolvedAt - b.lastSolvedAt;
      return a.updatedAt - b.updatedAt;
    })
    .map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      fullName: entry.fullName,
      avatarUrl: entry.avatarUrl,
      xp: entry.xp,
      college: entry.college,
      streak: entry.streak,
      solvedCount: entry.solvedCount,
      isPro: entry.isPro,
      devRank: entry.devRank,
    }));

  return Response.json({ leaderboard });
}
