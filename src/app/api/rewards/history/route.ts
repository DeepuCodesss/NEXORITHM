import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";
import { upsertClerkUser } from "@/lib/userSync";
import { Prisma } from "@/generated/prisma/client";
import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return apiSuccess({ history: [] });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(25, Math.max(5, Number(searchParams.get("pageSize") ?? "10") || 10));

  const prisma = getPrisma();
  const user = await upsertClerkUser(clerkUser);

  const typeFilter =
    type === "xp"
      ? ["xp"]
      : type === "coins"
        ? ["coins"]
        : type === "cash"
          ? ["cash"]
          : type === "withdrawals"
            ? ["cash", "coins"]
            : undefined;

  const filterSql =
    typeFilter && typeFilter.length
      ? Prisma.sql`AND type IN (${Prisma.join(typeFilter)})`
      : Prisma.empty;
  const items = await prisma.$queryRaw<Array<{
    id: string;
    type: string;
    source: string;
    amount: number;
    metadata: unknown;
    createdAt: Date;
  }>>(
    Prisma.sql`SELECT "id", "type", "source", "amount", "metadata", "createdAt"
      FROM "RewardTransaction"
      WHERE "userId" = ${user.id} ${filterSql}
      ORDER BY "createdAt" DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
  );
  const countRows = await prisma.$queryRaw<Array<{ count: number }>>(
    Prisma.sql`SELECT COUNT(*) as count FROM "RewardTransaction" WHERE "userId" = ${user.id} ${filterSql}`,
  );
  const total = Number(countRows[0]?.count ?? 0);

  return apiSuccess({
    history: items.map((item) => ({
      id: item.id,
      type: item.type,
      source: item.source,
      amount: item.amount,
      metadata: item.metadata,
      createdAt: item.createdAt.toISOString(),
    })),
    page,
    pageSize,
    total,
  });
}
