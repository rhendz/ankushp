'use client'

import siteMetadata from '@/data/siteMetadata'
import { KBarSearchProvider, KBarSearchProps } from './kbar'
import KBarButton from './kbar-button'

const BlogSearch = () => {
  if (siteMetadata.search?.provider !== 'kbar' || !siteMetadata.search.kbarConfig) {
    return null
  }

  return (
    <KBarSearchProvider kbarConfig={siteMetadata.search.kbarConfig as KBarSearchProps}>
      <KBarButton />
    </KBarSearchProvider>
  )
}

export default BlogSearch
