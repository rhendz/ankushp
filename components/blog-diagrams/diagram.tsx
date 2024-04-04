import React, { Suspense } from 'react'

interface DiagramProps {
  src: string
  caption?: string
  style?: React.CSSProperties
}

const Diagram: React.FC<DiagramProps> = ({ src, caption, style, ...rest }) => {
  const LazyDiagram = React.lazy(() => import(`${src}`))

  return (
    <>
      <Suspense fallback={<div className="text-secondary">Loading...</div>}>
        <div className="flex-1 flex-col items-center justify-center py-8">
          <div style={style}>
            <LazyDiagram {...rest} />
          </div>

          <p className="text-center">{caption && <span className="italic">{caption}</span>}</p>
        </div>
      </Suspense>
    </>
  )
}

export default Diagram
