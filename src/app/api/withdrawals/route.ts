import { randomUUID } from "crypto";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { upsertClerkUser } from "@/lib/userSync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const coins = Number(body?.coins);
  const cashAmount = Number(body?.cashAmount);
  const upiId = typeof body?.upiId === "string" ? body.upiId.trim() : "";

  if (!Number.isFinite(coins) || coins <= 0 || !Number.isFinite(cashAmount) || cashAmount <= 0 || !upiId) {
    return Response.json({ error: "Invalid withdrawal request." }, { status: 400 });
  }

  const prisma = getPrisma();
  const user = await upsertClerkUser(clerkUser);

  if (user.coins < coins) {
    return Response.json({ error: "Insufficient coins." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO Withdrawal (id, userId, coins, cashAmount, upiId, status, createdAt)
        VALUES (${randomUUID()}, ${user.id}, ${coins}, ${cashAmount}, ${upiId}, ${"pending"}, ${new Date()})`,
    );

    await tx.user.update({
      where: { id: user.id },
      data: { coins: user.coins - coins },
    });

    await tx.$executeRaw(
      Prisma.sql`INSERT INTO RewardTransaction (id, userId, type, source, amount, metadata, createdAt)
        VALUES (${randomUUID()}, ${user.id}, ${"coins"}, ${"withdrawal"}, ${-coins}, ${JSON.stringify({ cashAmount, upiId })}, ${new Date()})`,
    );

    return { ok: true };
  });

  return Response.json({ ok: true, result });
}
