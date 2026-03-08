'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'

type ClapState = {
  configured: boolean
  total: number
  user: number
  cap: number
}

type Particle = {
  id: number
  x: string
  y: string
  delayMs: number
  durationMs: number
}

const defaultState: ClapState = {
  configured: true,
  total: 0,
  user: 0,
  cap: 50,
}

const HOLD_REPEAT_DELAY_MS = 260
const HOLD_REPEAT_INTERVAL_MS = 170
const MAX_BATCH_SIZE = 5

export default function ClapButton({ slug }: { slug: string }) {
  const [state, setState] = useState<ClapState>(defaultState)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [error, setError] = useState('')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const isAtCap = state.user >= state.cap
  const hasLiked = state.user > 0

  const stateRef = useRef(state)
  const queuedClapsRef = useRef(0)
  const processingRef = useRef(false)
  const particleIdRef = useRef(0)
  const holdDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)
    updatePreference()

    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    let isCancelled = false

    const load = async () => {
      try {
        const response = await fetch(`/api/claps?slug=${encodeURIComponent(slug)}`, {
          method: 'GET',
        })
        const data = (await response.json()) as Partial<ClapState>

        if (!isCancelled) {
          setState((prev) => ({
            configured: data.configured ?? prev.configured,
            total: typeof data.total === 'number' ? data.total : prev.total,
            user: typeof data.user === 'number' ? data.user : prev.user,
            cap: typeof data.cap === 'number' ? data.cap : prev.cap,
          }))
        }
      } catch {
        // Keep defaults and let users still try liking.
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isCancelled = true
    }
  }, [slug])

  const launchBurst = (count: number, celebration = false) => {
    if (prefersReducedMotion) {
      return
    }

    const nextParticles: Particle[] = Array.from({ length: count }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.25
      const distance = celebration ? 52 + Math.random() * 28 : 36 + Math.random() * 18
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      const nextParticleId = Date.now() * 1000 + particleIdRef.current
      particleIdRef.current += 1

      return {
        id: nextParticleId,
        x: `${x.toFixed(1)}px`,
        y: `${y.toFixed(1)}px`,
        delayMs: Math.floor(Math.random() * 45),
        durationMs: celebration
          ? 640 + Math.floor(Math.random() * 220)
          : 420 + Math.floor(Math.random() * 160),
      }
    })

    setParticles((prev) => [...prev, ...nextParticles])
  }

  const stopHoldLike = () => {
    if (holdDelayTimeoutRef.current) {
      clearTimeout(holdDelayTimeoutRef.current)
      holdDelayTimeoutRef.current = null
    }

    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
  }

  const flushQueuedClaps = async () => {
    if (processingRef.current) {
      return
    }

    processingRef.current = true
    setIsProcessing(true)

    while (queuedClapsRef.current > 0) {
      const batchSize = Math.min(MAX_BATCH_SIZE, queuedClapsRef.current)
      queuedClapsRef.current -= batchSize

      try {
        const response = await fetch('/api/claps', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug, amount: batchSize }),
        })

        const data = (await response.json()) as Partial<ClapState> & {
          error?: string
          code?: string
        }

        if (!response.ok) {
          setState((current) => ({
            ...current,
            total: Math.max(0, current.total - batchSize),
            user: Math.max(0, current.user - batchSize),
          }))
          queuedClapsRef.current = 0
          setError(data.error || "Couldn't register like right now.")
          break
        }

        setState((current) => ({
          configured: data.configured ?? current.configured,
          // Keep optimistic UI monotonic while queued claps are still in flight.
          total:
            typeof data.total === 'number' ? Math.max(current.total, data.total) : current.total,
          user: typeof data.user === 'number' ? Math.max(current.user, data.user) : current.user,
          cap: typeof data.cap === 'number' ? data.cap : current.cap,
        }))

        if (
          typeof data.user === 'number' &&
          typeof data.cap === 'number' &&
          data.user >= data.cap
        ) {
          launchBurst(18, true)
          queuedClapsRef.current = 0
          break
        }
      } catch {
        setState((current) => ({
          ...current,
          total: Math.max(0, current.total - batchSize),
          user: Math.max(0, current.user - batchSize),
        }))
        queuedClapsRef.current = 0
        setError("Couldn't register like right now.")
        break
      }
    }

    processingRef.current = false
    setIsProcessing(false)
  }

  const enqueueClap = () => {
    if (
      isLoading ||
      !stateRef.current.configured ||
      stateRef.current.user >= stateRef.current.cap
    ) {
      return
    }

    setError('')
    setState((prev) => {
      if (prev.user >= prev.cap) {
        return prev
      }

      return {
        ...prev,
        total: prev.total + 1,
        user: Math.min(prev.user + 1, prev.cap),
      }
    })
    launchBurst(10, false)
    queuedClapsRef.current += 1
    void flushQueuedClaps()
  }

  const startHoldLike = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return
    }

    if (
      isLoading ||
      !stateRef.current.configured ||
      stateRef.current.user >= stateRef.current.cap
    ) {
      return
    }

    event.preventDefault()
    enqueueClap()

    holdDelayTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        enqueueClap()
      }, HOLD_REPEAT_INTERVAL_MS)
    }, HOLD_REPEAT_DELAY_MS)
  }

  const onButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      enqueueClap()
    }
  }

  useEffect(() => {
    return () => {
      stopHoldLike()
    }
  }, [])

  if (!state.configured && !isLoading) {
    return null
  }

  return (
    <div className="not-prose py-0.5">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onPointerDown={startHoldLike}
            onPointerUp={stopHoldLike}
            onPointerCancel={stopHoldLike}
            onPointerLeave={stopHoldLike}
            onKeyDown={onButtonKeyDown}
            disabled={!state.configured || isLoading}
            data-testid="like-button"
            aria-label={isAtCap ? `Like limit reached (${state.cap})` : 'Like this post'}
            aria-pressed={hasLiked}
            className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-full border text-xl leading-none transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
              hasLiked
                ? 'bg-accent/12 hover:bg-accent/16 border-accent/45 text-accent'
                : 'border-secondary/25 bg-transparent text-secondary hover:border-accent/40 hover:text-accent'
            } ${!state.configured || isLoading ? 'cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block select-none ${isProcessing ? 'scale-110' : 'scale-100'} transition`}
            >
              ❤
            </span>
          </button>

          {particles.map((particle) => (
            <span
              key={particle.id}
              aria-hidden="true"
              onAnimationEnd={() =>
                setParticles((prev) => prev.filter((current) => current.id !== particle.id))
              }
              className="pointer-events-none absolute left-1/2 top-1/2 text-sm text-accent"
              style={
                {
                  '--burst-x': particle.x,
                  '--burst-y': particle.y,
                  animationName: 'clap-burst',
                  animationDelay: `${particle.delayMs}ms`,
                  animationDuration: `${particle.durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                  animationFillMode: 'forwards',
                } as CSSProperties
              }
            >
              ♥
            </span>
          ))}
        </div>

        <span
          className="text-xs font-semibold text-secondary/80"
          data-testid="like-count"
          aria-live="polite"
        >
          {state.total.toLocaleString()}
        </span>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
