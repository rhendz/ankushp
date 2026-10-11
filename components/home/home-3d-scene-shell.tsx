'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import Home3DErrorBoundary from '@/components/home/home-3d-error-boundary'
import Home3DFallback from '@/components/home/home-3d-fallback'

const Home3DScene = dynamic(() => import('@/components/home/home-3d-scene'), {
  ssr: false,
  loading: () => null,
})

export default function Home3DSceneShell() {
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])
  const handleUnavailable = useCallback(() => {
    setReady(false)
    setUnavailable(true)
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setMotionAllowed(!preference.matches)
      setReady(false)
    }
    sync()
    preference.addEventListener('change', sync)
    return () => preference.removeEventListener('change', sync)
  }, [])

  const interactive = motionAllowed && !unavailable
  const status = !motionAllowed
    ? 'Reduced motion'
    : unavailable
      ? 'Still form'
      : !ready
        ? 'Loading form'
        : paused
          ? 'Motion paused'
          : 'Living form / 002'

  return (
    <figure className="home-visual" aria-label="A luminous, flowing blue and violet blob">
      <div className="home-visual-stage" data-testid="blob-stage">
        <div aria-hidden="true" className="absolute inset-0" hidden={ready && interactive}>
          <Home3DFallback />
        </div>
        {interactive && (
          <Home3DErrorBoundary fallback={null} onError={handleUnavailable}>
            <Home3DScene paused={paused} onReady={handleReady} onUnavailable={handleUnavailable} />
          </Home3DErrorBoundary>
        )}
      </div>
      <figcaption className="home-visual-caption">
        <span>{status}</span>
        <button
          type="button"
          className="home-motion-control"
          onClick={() => setPaused((value) => !value)}
          disabled={!interactive || !ready}
          aria-label={paused ? 'Resume animation' : 'Pause animation'}
        >
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </figcaption>
    </figure>
  )
}
