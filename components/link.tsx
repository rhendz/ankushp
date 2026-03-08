import Link from 'next/link'
import type { LinkProps } from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type CustomLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> &
  Omit<LinkProps, 'href'> & {
    href: string
    children: ReactNode
  }

const CustomLink = ({ href, children, ...rest }: CustomLinkProps) => {
  const isInternalLink = href.startsWith('/')
  const isAnchorLink = href.startsWith('#')

  if (isInternalLink) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }

  if (isAnchorLink) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <a target="_blank" rel="noopener noreferrer" href={href} {...rest}>
      {children}
    </a>
  )
}

export default CustomLink
