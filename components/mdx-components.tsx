import TOCInline from 'pliny/ui/TOCInline'
// import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image, { FormattedImage } from './image'
import CustomLink from './link'
import TableWrapper from './table-wrapper'
import Diagram from './blog-diagrams/diagram'

import Pre from './pre'

export const components: MDXComponents = {
  Image,
  Diagram,
  FormattedImage,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
}
