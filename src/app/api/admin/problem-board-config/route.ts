import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { apiError } from "@/lib/apiResponse";
import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) {
    return apiError("Admin access required.", 403);
  }

  const body = await request.json().catch(() => null);
  const showUpcomingRewards = Boolean(body?.showUpcomingRewards);
  const upcomingRewardItems = Array.isArray(body?.upcomingRewardItems)
    ? body.upcomingRewardItems.slice(0, 3).map((item: { problemId?: string }) => ({ problemId: item?.problemId ?? "" }))
    : [];

  const prisma = getPrisma();
  await prisma.$executeRaw(
    Prisma.sql`INSERT INTO ProblemBoardConfig (id, showUpcomingRewards, upcomingRewardItems, createdAt, updatedAt)
      VALUES (${ "singleton" }, ${showUpcomingRewards ? 1 : 0}, ${JSON.stringify(upcomingRewardItems)}, ${new Date()}, ${new Date()})
      ON CONFLICT(id) DO UPDATE SET
        showUpcomingRewards = excluded.showUpcomingRewards,
        upcomingRewardItems = excluded.upcomingRewardItems,
        updatedAt = excluded.updatedAt`,
  );

  return apiSuccess({ ok: true });
}
