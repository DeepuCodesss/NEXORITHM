import { getPrisma } from "@/lib/db";
import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function GET() {
  const prisma = getPrisma();
  const row = await prisma.$queryRaw<Array<{
    problemId: string;
    rewardMoney: number;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
  }>>`SELECT "problemId", "rewardMoney", "startsAt", "endsAt", "isActive"
    FROM "LiveReward"
    ORDER BY "createdAt" DESC
    LIMIT 1`;

  const liveReward = row[0]
    ? {
        problemId: row[0].problemId,
        rewardMoneyInr: Number(row[0].rewardMoney),
        startsAt: new Date(row[0].startsAt).toISOString(),
        endsAt: new Date(row[0].endsAt).toISOString(),
        isActive: row[0].isActive,
        paidAt: null,
        winnerUserId: null,
        winnerSubmissionId: null,
      }
    : null;

  return apiSuccess({ liveReward });
}
