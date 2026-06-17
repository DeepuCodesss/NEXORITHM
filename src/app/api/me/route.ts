import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";
import { apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return apiSuccess({ user: null });
  }

  const user = await upsertClerkUser(clerkUser);
  return apiSuccess({ user });
}
