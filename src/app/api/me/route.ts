import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return Response.json({ user: null }, { status: 200 });
  }

  const user = await upsertClerkUser(clerkUser);
  return Response.json({ user });
}

