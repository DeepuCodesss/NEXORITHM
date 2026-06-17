import { getPrisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

const defaultConfig = {
  showUpcomingRewards: true,
  upcomingRewardItems: [],
};

export async function GET() {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<Array<{
    id: string;
    showUpcomingRewards: number;
    upcomingRewardItems: unknown;
  }>>(Prisma.sql`SELECT id, showUpcomingRewards, upcomingRewardItems FROM ProblemBoardConfig WHERE id = ${"singleton"} LIMIT 1`);
  const row = rows[0];
  return apiSuccess({
    problemBoardConfig: row
      ? {
          showUpcomingRewards: row.showUpcomingRewards,
          upcomingRewardItems: Array.isArray(row.upcomingRewardItems) ? row.upcomingRewardItems : [],
        }
      : defaultConfig,
  });
}
