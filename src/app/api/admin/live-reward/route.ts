import { randomUUID } from "crypto";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { apiError } from "@/lib/apiResponse";
import { apiSuccess } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    logger.warn("auth.failure", { route: "/api/admin/live-reward", reason: "missing_user" });
    return apiError("Admin access required.", 403);
  }
  if (!isAdmin(clerkUser)) {
    logger.warn("auth.failure", { route: "/api/admin/live-reward", reason: "non_admin" });
    return apiError("Admin access required.", 403);
  }
  const adminId = clerkUser.id;

  const body = await request.json().catch(() => null);
  const problemId = typeof body?.problemId === "string" ? body.problemId : "";
  const rewardMoney = Number(body?.rewardMoney);
  const startsAt = new Date(body?.startsAt);
  const endsAt = new Date(body?.endsAt);
  const isActive = Boolean(body?.isActive);

  if (!problemId || !Number.isFinite(rewardMoney) || rewardMoney <= 0 || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return apiError("Invalid live reward payload.", 400);
  }

  const prisma = getPrisma();
  await prisma.$executeRaw(
    Prisma.sql`INSERT INTO "LiveReward" ("id", "problemId", "rewardMoney", "startsAt", "endsAt", "isActive", "createdAt")
      VALUES (${randomUUID()}, ${problemId}, ${rewardMoney}, ${startsAt}, ${endsAt}, ${isActive}, ${new Date()})
      ON CONFLICT ("problemId") DO UPDATE SET
        "rewardMoney" = excluded."rewardMoney",
        "startsAt" = excluded."startsAt",
        "endsAt" = excluded."endsAt",
        "isActive" = excluded."isActive"`,
  );

  logger.info("admin.live_reward.updated", { adminId, problemId, rewardMoney, isActive });

  const row = await prisma.$queryRaw<Array<{
    problemId: string;
    rewardMoney: number;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
  }>>`SELECT "problemId", "rewardMoney", "startsAt", "endsAt", "isActive"
    FROM "LiveReward"
    WHERE "problemId" = ${problemId}
    LIMIT 1`;

  return apiSuccess({
    liveReward: row[0]
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
      : null,
  });
}

export async function PATCH(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    logger.warn("auth.failure", { route: "/api/admin/live-reward", reason: "missing_user" });
    return apiError("Admin access required.", 403);
  }
  if (!isAdmin(clerkUser)) {
    logger.warn("auth.failure", { route: "/api/admin/live-reward", reason: "non_admin" });
    return apiError("Admin access required.", 403);
  }

  const body = await request.json().catch(() => null);
  if (!body?.announceResultsNow) {
    return apiError("Invalid live reward action.", 400);
  }

  const prisma = getPrisma();
  const latest = await prisma.liveReward.findFirst({ orderBy: { createdAt: "desc" } });
  if (!latest) {
    return apiError("No live reward configured.", 404);
  }

  const updated = await prisma.liveReward.update({
    where: { id: latest.id },
    data: {
      isActive: false,
      paidAt: new Date(),
    },
  });

  logger.info("admin.live_reward.announced", { adminId: clerkUser.id, problemId: updated.problemId });

  return apiSuccess({
    liveReward: {
      problemId: updated.problemId,
      rewardMoneyInr: Number(updated.rewardMoney),
      startsAt: updated.startsAt.toISOString(),
      endsAt: updated.endsAt.toISOString(),
      isActive: updated.isActive,
      paidAt: updated.paidAt?.toISOString() ?? null,
      winnerUserId: updated.winnerUserId ?? null,
      winnerSubmissionId: updated.winnerSubmissionId ?? null,
    },
  });
}
