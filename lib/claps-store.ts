import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'

const CLAPS_CAP_PER_VISITOR = 50
const RATE_LIMIT_PER_MINUTE = 120
const RATE_LIMIT_WINDOW_SECONDS = 60

const localTotals = new Map<string, number>()
const localUsers = new Map<string, number>()
const localRate = new Map<string, { count: number; expiresAt: number }>()

type ClapStoreStatus =
  | { configured: false }
  | { configured: true; mode: 'redis'; redis: Redis }
  | { configured: true; mode: 'local' }

export type ClapSummary = {
  configured: boolean
  total: number
  user: number
  cap: number
}

function getRedisStatus(): ClapStoreStatus {
  const forceRemoteStore = process.env.CLAPS_USE_REMOTE_STORE === 'true'
  const isNonProduction = process.env.NODE_ENV !== 'production'
  if (isNonProduction && !forceRemoteStore) {
    return { configured: true, mode: 'local' }
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return { configured: false }
  }

  return {
    configured: true,
    mode: 'redis',
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

export function resetLocalClapStoreForTests() {
  localTotals.clear()
  localUsers.clear()
  localRate.clear()
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

  if (status.mode === 'local') {
    return {
      configured: true,
      total: localTotals.get(totalKey(slug)) || 0,
      user: Math.min(CLAPS_CAP_PER_VISITOR, localUsers.get(userKey(slug, visitorId)) || 0),
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
  amount = 1,
}: {
  slug: string
  visitorId: string
  ip: string
  userAgent: string
  amount?: number
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

  const fingerprint = hashFingerprint(`${ip}|${userAgent}`)
  const rlKey = rateLimitKey(slug, fingerprint)
  const clampedAmount = Math.max(1, Math.min(10, Math.floor(amount)))

  if (status.mode === 'local') {
    const now = Date.now()
    const existingRate = localRate.get(rlKey)
    const activeRate =
      existingRate && existingRate.expiresAt > now
        ? existingRate
        : { count: 0, expiresAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 }

    const nextRate = {
      count: activeRate.count + 1,
      expiresAt: activeRate.expiresAt,
    }
    localRate.set(rlKey, nextRate)

    if (nextRate.count > RATE_LIMIT_PER_MINUTE) {
      return {
        ...(await getClapSummary(slug, visitorId)),
        limited: true,
      }
    }

    const perUserKey = userKey(slug, visitorId)
    const currentUser = localUsers.get(perUserKey) || 0
    if (currentUser >= CLAPS_CAP_PER_VISITOR) {
      return await getClapSummary(slug, visitorId)
    }

    const allowedAmount = Math.min(clampedAmount, CLAPS_CAP_PER_VISITOR - currentUser)
    const nextUserCount = currentUser + allowedAmount
    const totalStoreKey = totalKey(slug)
    const nextTotalCount = (localTotals.get(totalStoreKey) || 0) + allowedAmount
    localUsers.set(perUserKey, nextUserCount)
    localTotals.set(totalStoreKey, nextTotalCount)

    return {
      configured: true,
      total: nextTotalCount,
      user: Math.min(CLAPS_CAP_PER_VISITOR, nextUserCount),
      cap: CLAPS_CAP_PER_VISITOR,
    }
  }

  const redis = status.redis
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

  const allowedAmount = Math.min(clampedAmount, CLAPS_CAP_PER_VISITOR - currentUser)
  const [newUser, newTotal] = await Promise.all([
    redis.incrby(perUserKey, allowedAmount),
    redis.incrby(totalKey(slug), allowedAmount),
  ])

  return {
    configured: true,
    total: toNumber(newTotal),
    user: Math.min(CLAPS_CAP_PER_VISITOR, toNumber(newUser)),
    cap: CLAPS_CAP_PER_VISITOR,
  }
}
