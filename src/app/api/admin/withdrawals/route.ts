import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const isAdmin = (user: Awaited<ReturnType<typeof currentUser>>) => user?.publicMetadata?.role === "admin";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser || !isAdmin(clerkUser)) {
    logger.warn("auth.failure", { route: "/api/admin/withdrawals", reason: "non_admin" });
    return apiError("Admin access required.", 403);
  }

  const prisma = getPrisma();
  const requests = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  return apiSuccess({
    withdrawals: requests.map((request) => ({
      id: request.id,
      userId: request.userId,
      userName: request.user.fullName || request.user.username,
      upiId: request.upiId,
      amount: request.amount,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    })),
  });
}
