import { useId } from 'react'

// Static luminous poster: no render loop, filters, downloads, or WebGL needed.
export default function Home3DFallback() {
  const id = useId().replace(/:/g, '')
  const outline =
    'M245 66C310 56 356 91 370 145C387 196 416 240 378 299C348 348 304 387 247 382C180 379 129 367 104 313C79 259 90 215 107 162C125 107 182 74 245 66Z'
  return (
    <svg
      aria-hidden="true"
      data-testid="blob-fallback"
      className="hero-visual-shape absolute inset-0 h-full w-full"
      viewBox="0 0 480 460"
      fill="none"
    >
      <defs>
        <linearGradient
          id={`${id}-base`}
          x1="128"
          y1="90"
          x2="334"
          y2="365"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4932ff" />
          <stop offset=".38" stopColor="#992df8" />
          <stop offset=".68" stopColor="#7390ff" />
          <stop offset="1" stopColor="#4de9fa" />
        </linearGradient>
        <radialGradient id={`${id}-pink`} cx=".9" cy=".52" r=".7">
          <stop stopColor="#fbb5ff" />
          <stop offset=".45" stopColor="#dc59ff" stopOpacity=".8" />
          <stop offset="1" stopColor="#a935ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-light`} cx=".33" cy=".25" r=".55">
          <stop stopColor="#edfcff" stopOpacity=".95" />
          <stop offset=".24" stopColor="#d6e5ff" stopOpacity=".45" />
          <stop offset="1" stopColor="#9bb6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={outline} fill={`url(#${id}-base)`} />
      <path d={outline} fill={`url(#${id}-pink)`} />
      <path d={outline} fill={`url(#${id}-light)`} />
    </svg>
  )
}
