import dynamic from 'next/dynamic'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

import TOCInline from 'pliny/ui/TOCInline'
// import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Caption from './caption'
import Image from './image'
import CustomLink from './link'
import TableWrapper from './table-wrapper'

const Mermaid = dynamic(() => import('./mermaid'), {
  ssr: false,
})

import Pre from './pre'

export const components: MDXComponents = {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,

  Image,
  Caption,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  Mermaid,
}
