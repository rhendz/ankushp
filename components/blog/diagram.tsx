import React, { Suspense } from 'react'

interface DiagramProps {
  src: string
}

const Diagram: React.FC<DiagramProps> = ({ src }) => {
  const LazyDiagram = React.lazy(() => import(`${src}`))

  return (
    <>
      <Suspense fallback={<div className="text-secondary">Loading...</div>}>
        <LazyDiagram />
      </Suspense>
    </>
  )
}

export default Diagram
