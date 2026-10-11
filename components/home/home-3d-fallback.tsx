import { useId } from 'react'

// A static contour sculpture is available before JavaScript, during loading,
// and whenever motion or WebGL is unavailable.
export default function Home3DFallback() {
  const id = useId().replace(/:/g, '')
  const outline =
    'M 253,70 C 316,59 337,111 365,153 C 401,207 412,235 383,286 C 365,322 365,359 313,379 C 261,401 243,361 198,368 C 141,380 104,337 103,293 C 102,250 70,224 96,176 C 119,132 145,137 168,110 C 192,82 214,77 253,70 Z'
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
          id={`${id}-surface`}
          x1="145"
          y1="90"
          x2="355"
          y2="370"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="rgb(var(--color-secondary))" stopOpacity=".07" />
          <stop offset=".55" stopColor="rgb(var(--color-accent))" stopOpacity=".24" />
          <stop offset="1" stopColor="rgb(var(--color-accent))" stopOpacity=".65" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill={`url(#${id}-surface)`} />
      <g
        clipPath={`url(#${id}-clip)`}
        stroke="rgb(var(--color-secondary))"
        strokeOpacity=".26"
        strokeWidth=".8"
      >
        {Array.from({ length: 30 }, (_, index) => {
          const y = 40 + index * 12
          return (
            <path
              key={index}
              d={`M 62,${y} C 150,${y - 36} 178,${y + 40} 244,${y + 12} S 355,${y - 38} 427,${y + 8}`}
            />
          )
        })}
      </g>
      <path d={outline} stroke="rgb(var(--color-secondary))" strokeOpacity=".15" strokeWidth=".8" />
    </svg>
  )
}
