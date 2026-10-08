import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";
import { getPrisma } from "@/lib/db";
import { apiSuccess } from "@/lib/apiResponse";
import { getUserCashBalanceInr } from "@/lib/rewards";
import { getEffectiveCurrentStreak } from "@/lib/streak";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return apiSuccess({ user: null });
  }

  let user = await upsertClerkUser(clerkUser);
  const effectiveStreak = getEffectiveCurrentStreak(user.currentStreak, user.lastSolvedAt);
  if (effectiveStreak !== user.currentStreak) {
    user = await getPrisma().user.update({
      where: { id: user.id },
      data: { currentStreak: effectiveStreak },
    });
  }
  const moneyEarnedInr = await getUserCashBalanceInr(user.id);
  return apiSuccess({
    user: {
      ...user,
      moneyEarnedInr,
    },
  });
}
