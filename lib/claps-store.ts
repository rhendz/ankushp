import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'

const CLAPS_CAP_PER_VISITOR = 50
const RATE_LIMIT_PER_MINUTE = 120
const RATE_LIMIT_WINDOW_SECONDS = 60

type ClapStoreStatus = { configured: false } | { configured: true; redis: Redis }

export type ClapSummary = {
  configured: boolean
  total: number
  user: number
  cap: number
}

function getRedisStatus(): ClapStoreStatus {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return { configured: false }
  }

  return {
    configured: true,
    redis: new Redis({
      url,
      token,
    }),
  }
}

function totalKey(slug: string) {
  return `claps:total:${slug}`
}

function userKey(slug: string, visitorId: string) {
  return `claps:user:${slug}:${visitorId}`
}

function rateLimitKey(slug: string, fingerprint: string) {
  return `claps:rl:${slug}:${fingerprint}`
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function hashFingerprint(value: string) {
  const salt = process.env.CLAPS_FINGERPRINT_SALT || ''
  return createHash('sha256').update(`${value}|${salt}`, 'utf8').digest('hex').slice(0, 24)
}

export function getClapsCapPerVisitor() {
  return CLAPS_CAP_PER_VISITOR
}

export async function getClapSummary(slug: string, visitorId: string): Promise<ClapSummary> {
  const status = getRedisStatus()
  if (!status.configured) {
    return {
      configured: false,
      total: 0,
      user: 0,
      cap: CLAPS_CAP_PER_VISITOR,
    }
  }

  const [totalValue, userValue] = await Promise.all([
    status.redis.get<number | string>(totalKey(slug)),
    status.redis.get<number | string>(userKey(slug, visitorId)),
  ])

  return {
    configured: true,
    total: toNumber(totalValue),
    user: Math.min(CLAPS_CAP_PER_VISITOR, toNumber(userValue)),
    cap: CLAPS_CAP_PER_VISITOR,
  }
}

export async function addClap({
  slug,
  visitorId,
  ip,
  userAgent,
}: {
  slug: string
  visitorId: string
  ip: string
  userAgent: string
}): Promise<ClapSummary & { limited?: boolean }> {
  const status = getRedisStatus()
  if (!status.configured) {
    return {
      configured: false,
      total: 0,
      user: 0,
      cap: CLAPS_CAP_PER_VISITOR,
    }
  }

  const redis = status.redis
  const fingerprint = hashFingerprint(`${ip}|${userAgent}`)
  const rlKey = rateLimitKey(slug, fingerprint)
  const rlCount = await redis.incr(rlKey)
  if (rlCount === 1) {
    await redis.expire(rlKey, RATE_LIMIT_WINDOW_SECONDS)
  }
  if (rlCount > RATE_LIMIT_PER_MINUTE) {
    return {
      ...(await getClapSummary(slug, visitorId)),
      limited: true,
    }
  }

  const perUserKey = userKey(slug, visitorId)
  const currentUser = toNumber(await redis.get<number | string>(perUserKey))
  if (currentUser >= CLAPS_CAP_PER_VISITOR) {
    return await getClapSummary(slug, visitorId)
  }

  const [newUser, newTotal] = await Promise.all([
    redis.incr(perUserKey),
    redis.incr(totalKey(slug)),
  ])

  return {
    configured: true,
    total: toNumber(newTotal),
    user: Math.min(CLAPS_CAP_PER_VISITOR, toNumber(newUser)),
    cap: CLAPS_CAP_PER_VISITOR,
  }
}
