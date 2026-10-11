export type PointerSpring = { x: number; y: number; vx: number; vy: number }

// Exact critically damped spring solution: stable across variable frame times,
// with velocity carried between frames and no per-frame allocation.
export function advancePointerSpring(s: PointerSpring, x: number, y: number, seconds: number) {
  const frequency = 11
  const decay = Math.exp(-frequency * seconds)
  const offsetX = s.x - x
  const offsetY = s.y - y
  const impulseX = s.vx + frequency * offsetX
  const impulseY = s.vy + frequency * offsetY
  s.x = x + (offsetX + impulseX * seconds) * decay
  s.y = y + (offsetY + impulseY * seconds) * decay
  s.vx = (s.vx - frequency * impulseX * seconds) * decay
  s.vy = (s.vy - frequency * impulseY * seconds) * decay
}

// Change drawing-buffer size only after sustained evidence. The asymmetry
// between degradation and recovery avoids oscillation at the performance edge.
export class BlobQuality {
  ratio: number
  private maximum: number
  private duration = 0
  private frames = 0
  private slowWindows = 0
  private fastWindows = 0
  private cooldown = 1500

  constructor(maximum: number) {
    this.maximum = maximum
    this.ratio = maximum
  }

  resetTiming() {
    this.duration = 0
    this.frames = 0
    this.slowWindows = 0
    this.fastWindows = 0
    this.cooldown = 1500
  }

  setMaximum(maximum: number) {
    this.maximum = maximum
    this.ratio = Math.min(this.ratio, maximum)
    this.resetTiming()
  }

  sample(milliseconds: number) {
    if (milliseconds <= 0 || milliseconds > 250) {
      this.resetTiming()
      return this.ratio
    }
    if (this.cooldown > 0) {
      this.cooldown -= milliseconds
      return this.ratio
    }
    this.duration += milliseconds
    this.frames++
    if (this.duration < 1000) return this.ratio
    const average = this.duration / this.frames
    this.slowWindows = average > 23 ? this.slowWindows + 1 : 0
    this.fastWindows = average < 18 ? this.fastWindows + 1 : 0
    this.duration = 0
    this.frames = 0
    if (this.slowWindows >= 2 && this.ratio > 1) {
      this.ratio = Math.max(1, this.ratio - 0.25)
      this.resetTiming()
      this.cooldown = 3000
    } else if (this.fastWindows >= 8 && this.ratio < this.maximum) {
      this.ratio = Math.min(this.maximum, this.ratio + 0.25)
      this.resetTiming()
      this.cooldown = 3000
    }
    return this.ratio
  }
}
