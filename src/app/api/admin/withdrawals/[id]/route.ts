import { randomUUID } from "crypto";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status : "";
  if (!["approved", "rejected"].includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<Array<{ userId: string; coins: number; cashAmount: number; status: string }>>`
    SELECT userId, coins, cashAmount, status FROM Withdrawal WHERE id = ${id} LIMIT 1`;
  const withdrawal = rows[0];
  if (!withdrawal) {
    return Response.json({ error: "Withdrawal not found." }, { status: 404 });
  }

  if (withdrawal.status !== "pending") {
    return Response.json({ error: "Withdrawal already processed." }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(
      Prisma.sql`UPDATE Withdrawal SET status = ${status} WHERE id = ${id}`,
    );

    if (status === "approved") {
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
          VALUES (${randomUUID()}, ${withdrawal.userId}, ${"cash"}, ${"withdrawal_approved"}, ${-Math.round(Number(withdrawal.cashAmount))}, ${JSON.stringify({ withdrawalId: id })}, ${new Date()})`,
      );
    } else {
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
          VALUES (${randomUUID()}, ${withdrawal.userId}, ${"cash"}, ${"withdrawal_rejected"}, ${0}, ${JSON.stringify({ withdrawalId: id })}, ${new Date()})`,
      );
    }
  });

  return Response.json({ ok: true });
}
