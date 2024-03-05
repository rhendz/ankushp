import React, { Suspense } from 'react'

interface DiagramProps {
  src: string
  caption: string
  style?: React.CSSProperties
}

const Diagram: React.FC<DiagramProps> = ({ src, caption, style }) => {
  const LazyDiagram = React.lazy(() => import(`${src}`))

  const extractNumber = (str) => {
    const match = str.match(/\d+/)
    return match ? parseInt(match[0], 10) + 1 : null
  }

  const figureNumber = extractNumber(src)

  return (
    <>
      <Suspense fallback={<div className="text-secondary">Loading...</div>}>
        {figureNumber !== null && (
          <div
            id={`figure-${figureNumber}`}
            className="flex-1 flex-col items-center justify-center py-8"
          >
            <div style={style}>
              <LazyDiagram />
            </div>

            <p className="text-center">
              <span className="font-bold">Figure {figureNumber}: </span>
              <span className="italic">{caption}</span>
            </p>
          </div>
        )}
      </Suspense>
    </>
  )
}

export default Diagram
