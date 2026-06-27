import { getPrisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { college, avatarUrl } = body as { college?: unknown; avatarUrl?: unknown };

    const updates: { college?: string; avatarUrl?: string } = {};

    if (college !== undefined) {
      if (typeof college !== "string") {
        return apiError("Invalid college name", 400);
      }
      updates.college = college.trim();
    }

    if (avatarUrl !== undefined) {
      if (typeof avatarUrl !== "string" || !avatarUrl.trim()) {
        return apiError("Invalid avatar image", 400);
      }
      updates.avatarUrl = avatarUrl.trim();
    }

    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: updates,
    });

    return apiSuccess({ user });
  } catch (err: unknown) {
    console.error("Failed to update profile:", err);
    return apiError(err instanceof Error ? err.message : "Failed to update profile", 500);
  }
}
