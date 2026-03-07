'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

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

export default function ClapButton({ slug }: { slug: string }) {
  const [state, setState] = useState<ClapState>(defaultState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [error, setError] = useState('')

  const isAtCap = state.user >= state.cap

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
        // Keep defaults and let users still try clapping.
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

  const canClap = state.configured && !isSubmitting && !isLoading && !isAtCap

  const launchBurst = (count: number, celebration = false) => {
    const nextParticles: Particle[] = Array.from({ length: count }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.25
      const distance = celebration ? 52 + Math.random() * 28 : 36 + Math.random() * 18
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      return {
        id: Date.now() + index + Math.round(Math.random() * 1000),
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

  const helperText = useMemo(() => {
    if (!state.configured) {
      return 'Claps are currently unavailable.'
    }
    if (isAtCap) {
      return `Maxed out at ${state.cap}/${state.cap} claps from this browser.`
    }
    return `${state.user}/${state.cap} claps from you`
  }, [isAtCap, state.cap, state.configured, state.user])

  const onClap = async () => {
    if (!canClap) {
      return
    }

    setError('')
    setIsSubmitting(true)
    const prevState = state
    setState((current) => ({
      ...current,
      total: current.total + 1,
      user: Math.min(current.user + 1, current.cap),
    }))
    launchBurst(10, false)

    try {
      const response = await fetch('/api/claps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      })

      const data = (await response.json()) as Partial<ClapState> & {
        error?: string
        code?: string
      }

      if (!response.ok) {
        setState(prevState)
        setError(data.error || "Couldn't register clap right now.")
        return
      }

      setState((current) => ({
        configured: data.configured ?? current.configured,
        total: typeof data.total === 'number' ? data.total : current.total,
        user: typeof data.user === 'number' ? data.user : current.user,
        cap: typeof data.cap === 'number' ? data.cap : current.cap,
      }))

      if (typeof data.user === 'number' && typeof data.cap === 'number' && data.user >= data.cap) {
        launchBurst(18, true)
      }
    } catch {
      setState(prevState)
      setError("Couldn't register clap right now.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!state.configured && !isLoading) {
    return null
  }

  return (
    <div className="not-prose py-4">
      <div className="flex items-center justify-between rounded-xl border border-secondary/20 bg-secondary/[0.04] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-secondary">Enjoyed this article?</p>
          <p className="text-xs text-secondary/65">
            {state.total.toLocaleString()} claps · {helperText}
          </p>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onClap}
            disabled={!canClap}
            aria-label={isAtCap ? `Clap limit reached (${state.cap})` : 'Send a clap'}
            className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-2xl leading-none text-accent transition hover:scale-105 hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span
              className={`inline-block select-none ${isSubmitting ? 'scale-110' : 'scale-100'} transition`}
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
      </div>

      <style jsx>{`
        @keyframes clap-burst {
          0% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(0.6);
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y)))
              scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
