import { currentUser } from "@clerk/nextjs/server";
import { upsertClerkUser } from "@/lib/userSync";
import { getPrisma } from "@/lib/db";
import { apiSuccess } from "@/lib/apiResponse";
import { getUserCashBalanceInr } from "@/lib/rewards";
import { calendarDaysBetween, getDateKeyInTimeZone } from "@/lib/streak";

export const runtime = "nodejs";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return apiSuccess({ user: null });
  }

  let user = await upsertClerkUser(clerkUser);
  if (user.currentStreak > 0 && user.lastSolvedAt) {
    const daysSinceLastSolve = calendarDaysBetween(
      getDateKeyInTimeZone(new Date()),
      getDateKeyInTimeZone(new Date(user.lastSolvedAt)),
    );
    if (daysSinceLastSolve > 1) {
      user = await getPrisma().user.update({
        where: { id: user.id },
        data: { currentStreak: 0 },
      });
    }
  }
  const moneyEarnedInr = await getUserCashBalanceInr(user.id);
  return apiSuccess({
    user: {
      ...user,
      moneyEarnedInr,
    },
  });
}
