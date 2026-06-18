import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";
import { apiSuccess } from "@/lib/apiResponse";
import { getUserCashBalanceInr } from "@/lib/rewards";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return apiSuccess({ user: null });
  }

  const user = await upsertClerkUser(clerkUser);
  const moneyEarnedInr = await getUserCashBalanceInr(user.id);
  return apiSuccess({
    user: {
      ...user,
      moneyEarnedInr,
    },
  });
}
