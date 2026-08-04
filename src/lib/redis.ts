import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | null };

let redis: Redis | null = null;

function createRedis(): Redis | null {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || url.includes("dummy")) return null;

    const client = new Redis(url, {
      password: token,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    return client;
  } catch {
    return null;
  }
}

if (process.env.NODE_ENV !== "production") {
  if (!globalForRedis.redis) globalForRedis.redis = createRedis();
  redis = globalForRedis.redis;
} else {
  redis = createRedis();
}

const inMemoryStore = new Map<string, { value: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) {
    const now = Date.now();
    const entry = inMemoryStore.get(key);
    if (!entry || now > entry.resetAt) {
      inMemoryStore.set(key, { value: 1, resetAt: now + windowSeconds * 1000 });
      return { success: true, remaining: limit - 1 };
    }
    entry.value++;
    if (entry.value > limit) return { success: false, remaining: 0 };
    return { success: true, remaining: limit - entry.value };
  }

  try {
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, windowSeconds);
    const results = await multi.exec();
    const count = (results?.[0]?.[1] as number) ?? 1;
    const remaining = Math.max(0, limit - count);
    return { success: count <= limit, remaining };
  } catch {
    return { success: true, remaining: limit };
  }
}

export { redis };
