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
    const { college } = await request.json();
    if (typeof college !== "string") {
      return apiError("Invalid college name", 400);
    }

    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { college: college.trim() },
    });

    return apiSuccess({ user });
  } catch (err: unknown) {
    console.error("Failed to update profile:", err);
    return apiError(err instanceof Error ? err.message : "Failed to update profile", 500);
  }
}
