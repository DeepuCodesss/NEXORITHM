import { getPrisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clerkUser = await currentUser();
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return Response.json({ error: "Username query parameter is required" }, { status: 400 });
  }

  // Validate username characters (alphanumeric and underscores only, length 3 to 25)
  if (!/^[a-z0-9_]{3,25}$/.test(username)) {
    return Response.json({ available: false, error: "Username must be 3-25 alphanumeric characters or underscores." });
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { clerkId: true }
    });

    if (!existing) {
      return Response.json({ available: true });
    }

    // If the username is already owned by the current user, it is available to keep
    if (clerkUser && existing.clerkId === clerkUser.id) {
      return Response.json({ available: true });
    }

    return Response.json({ available: false, error: "Username is already taken." });
  } catch (err: unknown) {
    console.error("Failed to check username:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
