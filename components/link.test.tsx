import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import CustomLink from './link'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('CustomLink', () => {
  it('renders internal links without forcing external target behavior', () => {
    render(<CustomLink href="/blog/posts">Posts</CustomLink>)

    const link = screen.getByRole('link', { name: 'Posts' })
    expect(link.getAttribute('href')).toBe('/blog/posts')
    expect(link.getAttribute('target')).toBeNull()
    expect(link.getAttribute('rel')).toBeNull()
  })

  it('renders hash links as in-page anchors', () => {
    render(<CustomLink href="#section-1">Jump</CustomLink>)

    const link = screen.getByRole('link', { name: 'Jump' })
    expect(link.getAttribute('href')).toBe('#section-1')
    expect(link.getAttribute('target')).toBeNull()
  })

  it('renders external links with safe target/rel', () => {
    render(<CustomLink href="https://example.com">External</CustomLink>)

    const link = screen.getByRole('link', { name: 'External' })
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
