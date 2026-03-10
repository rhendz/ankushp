'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

const CommentsComponent = dynamic(
  () => import('pliny/comments').then((mod) => mod.Comments),
  {
    ssr: false,
  }
)

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  return (
    <>
      {!loadComments && <button onClick={() => setLoadComments(true)}>Load Comments</button>}
      {siteMetadata.comments && loadComments && (
        <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
      )}
    </>
  )
}
