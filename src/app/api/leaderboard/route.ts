import { getPrisma } from "@/lib/db";
import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

const buildLeaderboard = (users: Array<{
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  college: string;
  currentStreak: number;
  solvedProblemIds: unknown;
  isPro: boolean;
  devRank: number;
  lastSolvedAt: Date | null;
  updatedAt: Date;
}>) =>
  users
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

export async function GET(request: Request) {
  const prisma = getPrisma();
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "global";
  const college = searchParams.get("college") ?? "";
  const now = new Date();

  const users = await prisma.user.findMany({
    select: {
      username: true,
      fullName: true,
      avatarUrl: true,
      xp: true,
      college: true,
      currentStreak: true,
      solvedProblemIds: true,
      isPro: true,
      devRank: true,
      lastSolvedAt: true,
      updatedAt: true,
    },
  });
  const filteredUsers = (() => {
    if (scope === "college" && college) {
      return users.filter((user) => user.college === college);
    }
    if (scope === "monthly") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return users.filter((user) => {
        const solvedAt = user.lastSolvedAt ?? user.updatedAt;
        return solvedAt >= start;
      });
    }
    return users;
  })();

  const leaderboard = buildLeaderboard(filteredUsers);

  return apiSuccess({ leaderboard });
}
