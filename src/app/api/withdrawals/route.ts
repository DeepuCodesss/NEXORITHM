import { randomUUID } from "crypto";
import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import { getPendingWithdrawalAmountInr, getUserCashBalanceInr } from "@/lib/rewards";
import { upsertClerkUser } from "@/lib/userSync";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return apiSuccess({ withdrawalRequests: [], currentBalance: 0, availableBalance: 0 });
  }

  const prisma = getPrisma();
  const user = await upsertClerkUser(clerkUser);
  const [currentBalance, pendingBalance, withdrawalRequests] = await Promise.all([
    getUserCashBalanceInr(user.id),
    getPendingWithdrawalAmountInr(user.id),
    prisma.withdrawalRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  const availableBalance = Math.max(0, currentBalance - pendingBalance);

  return apiSuccess({
    currentBalance,
    availableBalance,
    withdrawalRequests: withdrawalRequests.map((request) => ({
      id: request.id,
      amount: request.amount,
      upiId: request.upiId,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    logger.warn("auth.failure", { route: "/api/withdrawals", reason: "missing_user" });
    return apiError("Authentication required.", 401);
  }

  const body = await request.json().catch(() => null);
  const amount = Math.floor(Number(body?.amount));
  const upiId = typeof body?.upiId === "string" ? body.upiId.trim() : "";
  if (!Number.isFinite(amount) || amount <= 0 || !upiId) {
    return apiError("Invalid withdrawal request.", 400);
  }

  const prisma = getPrisma();
  const user = await upsertClerkUser(clerkUser);
  const currentBalance = await getUserCashBalanceInr(user.id);
  const pendingBalance = await getPendingWithdrawalAmountInr(user.id);
  const availableBalance = Math.max(0, currentBalance - pendingBalance);

  if (amount > availableBalance) {
    return apiError("Amount exceeds available balance.", 409);
  }

  const pending = await prisma.withdrawalRequest.findFirst({
    where: { userId: user.id, status: "pending" },
    select: { id: true },
  });
  if (pending) {
    return apiError("You already have a pending withdrawal request.", 409);
  }

  const requestRow = await prisma.withdrawalRequest.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      amount,
      upiId,
      status: "pending",
    },
  });

  logger.info("withdrawal.requested", { userId: user.id, amount });
  return apiSuccess({
    withdrawalRequest: {
      id: requestRow.id,
      amount: requestRow.amount,
      upiId: requestRow.upiId,
      status: requestRow.status,
      createdAt: requestRow.createdAt.toISOString(),
      updatedAt: requestRow.updatedAt.toISOString(),
    },
  });
}
