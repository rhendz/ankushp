import { describe, expect, it } from 'vitest'
import { advancePointerSpring, BlobQuality } from './blob-motion'

describe('blob motion', () => {
  it('settles identically at 30Hz and 120Hz without overshoot', () => {
    const slow = { x: 0, y: 0, vx: 0, vy: 0 }
    const fast = { ...slow }
    for (let i = 0; i < 30; i++) advancePointerSpring(slow, 1, -1, 1 / 30)
    for (let i = 0; i < 120; i++) advancePointerSpring(fast, 1, -1, 1 / 120)
    expect(slow.x).toBeCloseTo(fast.x, 10)
    expect(slow.y).toBeCloseTo(fast.y, 10)
    expect(slow.x).toBeGreaterThan(0.99)
    expect(slow.x).toBeLessThanOrEqual(1)
    advancePointerSpring(slow, -1, 0.5, 10)
    expect(slow.x).toBeCloseTo(-1)
    expect(slow.y).toBeCloseTo(0.5)
  })

  it('reduces sustained slow rendering, respects the floor, and recovers slowly', () => {
    const quality = new BlobQuality(1.75)
    for (let i = 0; i < 60; i++) quality.sample(1000 / 30)
    expect(quality.ratio).toBe(1.75) // brief warmup/slow window is insufficient
    for (let i = 0; i < 900; i++) quality.sample(1000 / 30)
    expect(quality.ratio).toBe(1)
    for (let i = 0; i < 180; i++) quality.sample(1000 / 60)
    expect(quality.ratio).toBe(1) // avoid rapid quality oscillation
    for (let i = 0; i < 3000; i++) quality.sample(1000 / 60)
    expect(quality.ratio).toBe(1.75)
  })

  it('ignores suspension gaps and preserves reduced quality through a resize', () => {
    const quality = new BlobQuality(1.75)
    for (let i = 0; i < 140; i++) quality.sample(1000 / 30)
    expect(quality.ratio).toBe(1.5)
    quality.sample(5000)
    quality.setMaximum(1.75)
    expect(quality.ratio).toBe(1.5)
    quality.setMaximum(1)
    expect(quality.ratio).toBe(1)
  })
})
