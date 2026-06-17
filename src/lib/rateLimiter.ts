import "server-only";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export interface RateLimitStore {
  hit(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult>;
}

class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    this.store.set(key, entry);
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
  }
}

class RedisRateLimitStore implements RateLimitStore {
  private readonly url: URL;

  constructor(redisUrl: string) {
    this.url = new URL(redisUrl);
  }

  private async send(command: string[]): Promise<string> {
    const net = await import("net");
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(
        {
          host: this.url.hostname,
          port: Number(this.url.port || 6379),
        },
        () => {
          const auth = this.url.password ? [`AUTH`, decodeURIComponent(this.url.password)] : [];
          const db = this.url.pathname && this.url.pathname !== "/" ? ["SELECT", this.url.pathname.slice(1)] : [];
          const commands = [...auth, ...db, ...command];
          const payload = commands
            .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
            .join("");
          socket.write(`*${commands.length}\r\n${payload}`);
        },
      );

      let data = "";
      socket.on("data", (chunk) => {
        data += chunk.toString("utf8");
        if (data.endsWith("\r\n")) {
          socket.end();
        }
      });
      socket.on("end", () => {
        if (data.startsWith("-")) {
          reject(new Error(data.slice(1).trim()));
          return;
        }
        resolve(data);
      });
      socket.on("error", reject);
    });
  }

  async hit(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now();
    const redisKey = `rl:${key}`;
    const raw = await this.send(["INCR", redisKey]);
    const count = Number(raw.trim().replace(/^\+/, ""));
    if (Number.isNaN(count)) {
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    if (count === 1) {
      await this.send(["PEXPIRE", redisKey, String(windowMs)]);
    }

    const ttl = await this.send(["PTTL", redisKey]);
    const remaining = Math.max(0, maxRequests - count);
    return {
      allowed: count <= maxRequests,
      remaining,
      resetAt: now + Math.max(0, Number(ttl.trim().replace(/^\+/, "")) || windowMs),
    };
  }
}

const windowMs = 60_000;
const maxRequests = 30;

const createStore = (): RateLimitStore => {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) return new RedisRateLimitStore(redisUrl);
  return new MemoryRateLimitStore();
};

const store = createStore();

export const checkRateLimit = (key: string) => store.hit(key, windowMs, maxRequests);
