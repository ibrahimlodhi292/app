import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
let _initialized = false;

function getRedis(): Redis | null {
  if (_initialized) return _redis;
  _initialized = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "your-upstash-url" || token === "your-upstash-token") {
    return null;
  }
  try {
    _redis = new Redis({ url, token });
  } catch {
    _redis = null;
  }
  return _redis;
}

export const CACHE_KEYS = {
  conversation: (id: string) => `conv:${id}`,
  rateLimit: (ip: string) => `rate:${ip}`,
  session: (token: string) => `session:${token}`,
  embeddings: (docId: string) => `embed:${docId}`,
  settings: (restaurantId: string) => `settings:${restaurantId}`,
  analytics: (restaurantId: string, date: string) => `analytics:${restaurantId}:${date}`,
} as const;

export const CACHE_TTL = {
  conversation: 3600,
  session: 86400,
  settings: 300,
  analytics: 3600,
  rateLimit: 60,
} as const;

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttl?: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
  } catch {
    // silent — Redis is a cache, not critical
  }
}

export async function deleteCached(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {}
}

export async function checkRateLimit(
  key: string,
  limit: number = Number(process.env.RATE_LIMIT_REQUESTS) || 100,
  windowMs: number = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedis();
  if (!redis) {
    // No Redis → allow all requests
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowMs };
  }

  const windowSec = Math.floor(windowMs / 1000);
  try {
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSec);
    const ttl = await redis.ttl(key);
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt: Date.now() + ttl * 1000,
    };
  } catch {
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowMs };
  }
}
