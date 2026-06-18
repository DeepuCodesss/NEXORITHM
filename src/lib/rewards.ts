import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";

const CASH_EARNING_SOURCES = ["live_reward", "streak_reward"];

export const MIN_WITHDRAWAL_INR = 50;

export const getUserCashBalanceInr = async (userId: string) => {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<Array<{ balance: number }>>(
    Prisma.sql`SELECT COALESCE(SUM("amount"), 0) AS balance
      FROM "RewardTransaction"
      WHERE "userId" = ${userId}
        AND "type" = 'cash'
        AND "source" = ANY(${CASH_EARNING_SOURCES})`,
  );
  return Number(rows[0]?.balance ?? 0);
};

export const getPendingWithdrawalAmountInr = async (userId: string) => {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<Array<{ total: number }>>(
    Prisma.sql`SELECT COALESCE(SUM("amount"), 0) AS total
      FROM "WithdrawalRequest"
      WHERE "userId" = ${userId}
        AND "status" = 'pending'`,
  );
  return Number(rows[0]?.total ?? 0);
};

export const getAvailableWithdrawalBalanceInr = async (userId: string) => {
  const [cashBalance, pending] = await Promise.all([
    getUserCashBalanceInr(userId),
    getPendingWithdrawalAmountInr(userId),
  ]);
  return Math.max(0, cashBalance - pending);
};
