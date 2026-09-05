import { Redis } from '@upstash/redis'

/**
 * Vercel's Upstash integration exports the KV_REST_API_* names under an
 * `UPSTASH_REDIS_REST` prefix; a manually configured project uses the plain
 * Upstash names. Accept either so the store is not silently unconfigured.
 */
export function getRedisCredentials() {
  const url =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  return { url, token }
}

export function getRedisClient(): Redis | null {
  const credentials = getRedisCredentials()
  return credentials ? new Redis(credentials) : null
}
