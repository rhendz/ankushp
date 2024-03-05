import TOCInline from 'pliny/ui/TOCInline'
// import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './image'
import ThemedImage from './themed-image'
import CustomLink from './link'
import Highlight from './highlight'
import TableWrapper from './table-wrapper'
import Diagram from './blog/diagram'

import Pre from './pre'

export const components: MDXComponents = {
  Diagram,
  Image,
  ThemedImage,
  TOCInline,
  Highlight,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
}
