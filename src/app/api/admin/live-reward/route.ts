import { randomUUID } from "crypto";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const problemId = typeof body?.problemId === "string" ? body.problemId : "";
  const rewardMoney = Number(body?.rewardMoney);
  const startsAt = new Date(body?.startsAt);
  const endsAt = new Date(body?.endsAt);
  const isActive = Boolean(body?.isActive);

  if (!problemId || !Number.isFinite(rewardMoney) || rewardMoney <= 0 || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return Response.json({ error: "Invalid live reward payload." }, { status: 400 });
  }

  const prisma = getPrisma();
  await prisma.$executeRaw(
    Prisma.sql`INSERT INTO LiveReward (id, problemId, rewardMoney, startsAt, endsAt, isActive, createdAt)
      VALUES (${randomUUID()}, ${problemId}, ${rewardMoney}, ${startsAt}, ${endsAt}, ${isActive ? 1 : 0}, ${new Date()})
      ON CONFLICT(problemId) DO UPDATE SET
        rewardMoney = excluded.rewardMoney,
        startsAt = excluded.startsAt,
        endsAt = excluded.endsAt,
        isActive = excluded.isActive`,
  );

  const row = await prisma.$queryRaw<Array<{
    problemId: string;
    rewardMoney: number;
    startsAt: Date;
    endsAt: Date;
    isActive: number;
  }>>`SELECT problemId, rewardMoney, startsAt, endsAt, isActive
    FROM LiveReward
    WHERE problemId = ${problemId}
    LIMIT 1`;

  return Response.json({
    liveReward: row[0]
      ? {
          problemId: row[0].problemId,
          rewardMoneyInr: Number(row[0].rewardMoney),
          startsAt: new Date(row[0].startsAt).toISOString(),
          endsAt: new Date(row[0].endsAt).toISOString(),
          isActive: Boolean(row[0].isActive),
        }
      : null,
  });
}
