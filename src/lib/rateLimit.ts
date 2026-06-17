import "server-only";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const windowMs = 60_000;
const maxRequests = 30;
const store = new Map<string, RateLimitEntry>();

export const checkRateLimit = (key: string) => {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
};
