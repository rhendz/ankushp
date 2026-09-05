import { getRedisClient } from '@/lib/redis'

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number }

const localCounters = new Map<string, { count: number; expiresAt: number }>()

function consumeLocal(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const existing = localCounters.get(key)
  const window =
    existing && existing.expiresAt > now
      ? existing
      : { count: 0, expiresAt: now + windowSeconds * 1000 }

  window.count += 1
  localCounters.set(key, window)

  return {
    allowed: window.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((window.expiresAt - now) / 1000)),
  }
}

/**
 * Fixed-window rate limit shared by the public API routes. Backed by Upstash
 * when credentials are present and by an in-process counter otherwise, so local
 * development and preview deployments still exercise the limit. Fails open: if
 * the counter store errors, the request is allowed through rather than dropped.
 */
export async function consumeRateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string
  limit: number
  windowSeconds: number
}): Promise<RateLimitResult> {
  const redis = getRedisClient()
  if (!redis) {
    return consumeLocal(key, limit, windowSeconds)
  }

  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }

    const ttl = count > limit ? await redis.ttl(key) : 0

    return {
      allowed: count <= limit,
      retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
    }
  } catch {
    return { allowed: true, retryAfterSeconds: 0 }
  }
}

export function resetLocalRateLimitForTests() {
  localCounters.clear()
}
