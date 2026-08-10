export const STREAK_TIME_ZONE = "Asia/Kolkata";

export const getDateKeyInTimeZone = (value: Date, timeZone = STREAK_TIME_ZONE) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);

export const calendarDaysBetween = (currentDayKey: string, previousDayKey: string) => {
  const current = Date.parse(`${currentDayKey}T00:00:00Z`);
  const previous = Date.parse(`${previousDayKey}T00:00:00Z`);
  return Math.round((current - previous) / 86_400_000);
};

export const nextStreakValue = (currentStreak: number, lastSolvedAt: Date | null, now = new Date()) => {
  if (!lastSolvedAt) return 1;

  const daysSinceLastSolve = calendarDaysBetween(
    getDateKeyInTimeZone(now),
    getDateKeyInTimeZone(lastSolvedAt),
  );

  if (daysSinceLastSolve <= 0) return Math.max(currentStreak, 1);
  if (daysSinceLastSolve === 1) return Math.max(currentStreak, 1) + 1;
  return 1;
};
