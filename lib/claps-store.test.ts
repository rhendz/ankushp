import { beforeEach, describe, expect, it } from 'vitest'
import {
  addClap,
  getClapSummary,
  getClapsCapPerVisitor,
  resetLocalClapStoreForTests,
} from '@/lib/claps-store'

describe('claps-store (local mock mode)', () => {
  beforeEach(() => {
    resetLocalClapStoreForTests()
  })

  it('starts at zero and increments counts', async () => {
    const slug = 'sample-post'
    const visitorId = 'visitor-a'

    const initial = await getClapSummary(slug, visitorId)
    expect(initial.configured).toBe(true)
    expect(initial.total).toBe(0)
    expect(initial.user).toBe(0)

    const afterLike = await addClap({
      slug,
      visitorId,
      ip: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(afterLike.configured).toBe(true)
    expect(afterLike.total).toBe(1)
    expect(afterLike.user).toBe(1)
    expect(afterLike.cap).toBe(getClapsCapPerVisitor())
  })

  it('enforces cap of 50 claps per visitor per post', async () => {
    const slug = 'cap-post'
    const visitorId = 'visitor-cap'

    for (let index = 0; index < 80; index += 1) {
      await addClap({
        slug,
        visitorId,
        ip: '127.0.0.1',
        userAgent: 'vitest',
      })
    }

    const summary = await getClapSummary(slug, visitorId)
    expect(summary.user).toBe(50)
    expect(summary.total).toBe(50)
    expect(summary.cap).toBe(50)
  })

  it('rate limits excessive writes from same fingerprint', async () => {
    const slug = 'rate-limit-post'
    const visitorId = 'visitor-rate-limit'

    let limitedAt = -1
    for (let index = 1; index <= 200; index += 1) {
      const response = await addClap({
        slug,
        visitorId: `${visitorId}-${index}`,
        ip: '203.0.113.10',
        userAgent: 'bot-simulator',
      })

      if (response.limited) {
        limitedAt = index
        break
      }
    }

    expect(limitedAt).toBeGreaterThan(0)
    expect(limitedAt).toBeLessThanOrEqual(121)
  })
})
