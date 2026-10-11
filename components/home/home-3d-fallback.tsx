import { useId } from 'react'

// Match the original color field and theme distinction without a graphics context.
export default function Home3DFallback() {
  const id = useId().replace(/:/g, '')
  const outline =
    'M239 48C331 47 400 99 417 179C443 260 390 351 315 388C229 428 125 391 84 318C49 255 62 165 107 107C140 66 184 49 239 48Z'
  return (
    <svg
      aria-hidden="true"
      data-testid="blob-fallback"
      className="hero-visual-shape absolute inset-0 h-full w-full"
      viewBox="0 0 480 460"
      fill="none"
    >
      <defs>
        <linearGradient id={`${id}-base`} x1=".35" y1="0" x2=".6" y2="1">
          <stop stopColor="#6324ff" />
          <stop offset=".42" stopColor="#664bff" />
          <stop offset=".75" stopColor="#49b8ff" />
          <stop offset="1" stopColor="#31fff7" />
        </linearGradient>
        <radialGradient id={`${id}-pink`} cx="1" cy=".46" r=".9">
          <stop stopColor="#f27bff" />
          <stop offset=".48" stopColor="#db51ff" stopOpacity=".8" />
          <stop offset="1" stopColor="#a935ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-light`} cx=".58" cy=".95" r=".58">
          <stop stopColor="#ffffff" />
          <stop offset=".13" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset=".55" stopColor="#d3fcff" stopOpacity=".25" />
          <stop offset="1" stopColor="#bfe9ff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-lattice`} width="6" height="10.392" patternUnits="userSpaceOnUse">
          <path
            d="M0 0H6M0 5.196H6M0 10.392H6M0 0L6 10.392M6 0L0 10.392"
            stroke="white"
            strokeWidth=".55"
          />
        </pattern>
        <mask id={`${id}-mesh`}>
          <path d={outline} fill={`url(#${id}-lattice)`} />
        </mask>
        <g id={`${id}-body`}>
          <path d={outline} fill={`url(#${id}-base)`} />
          <path d={outline} fill={`url(#${id}-pink)`} />
          <path d={outline} fill={`url(#${id}-light)`} />
        </g>
      </defs>
      <use href={`#${id}-body`} className="blob-poster-solid" />
      <g className="blob-poster-mesh">
        <use href={`#${id}-body`} opacity=".06" />
        <use href={`#${id}-body`} mask={`url(#${id}-mesh)`} />
      </g>
    </svg>
  )
}
