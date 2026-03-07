import { cleanup, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Action } from 'kbar'
import { KBarModal } from './kbar-modal'

const mocks = vi.hoisted(() => ({
  results: [] as Array<Action | string>,
  registerActions: vi.fn(),
}))

vi.mock('kbar', () => ({
  KBarPortal: ({ children }: { children: React.ReactNode }) => children,
  KBarPositioner: ({
    children,
    ...props
  }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
  KBarAnimator: ({
    children,
    ...props
  }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
  KBarSearch: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input role="combobox" aria-controls="kbar-listbox" aria-expanded="true" {...props} />
  ),
  KBarResults: ({
    items,
    onRender,
  }: {
    items: Array<Action | string>
    onRender: ({ item, active }: { item: Action | string; active: boolean }) => React.ReactElement
  }) => (
    <div id="kbar-listbox" role="listbox">
      {items.map((item, index) => (
        <div
          key={typeof item === 'string' ? `${item}-${index}` : item.id}
          id={`kbar-listbox-item-${index}`}
          role="option"
          aria-selected={index === 0}
        >
          {onRender({ item, active: index === 0 })}
        </div>
      ))}
    </div>
  ),
  useMatches: () => ({ results: mocks.results }),
  useRegisterActions: (...args: unknown[]) => mocks.registerActions(...args),
}))

describe('KBarModal', () => {
  afterEach(() => {
    cleanup()
    mocks.results = []
    mocks.registerActions.mockReset()
  })

  it('renders labelled dialog, combobox, and results semantics', async () => {
    mocks.results = [
      {
        id: 'post-1',
        name: 'Post 1',
        subtitle: 'March 7, 2026',
      },
    ]

    render(<KBarModal actions={[]} isLoading={false} />)

    expect(screen.getByRole('dialog', { name: 'Command menu' })).toBeTruthy()

    const searchInput = screen.getByRole('combobox', { name: 'Search commands' })
    expect(searchInput.getAttribute('id')).toBe('kbar-search-input')
    expect(searchInput.getAttribute('aria-describedby')).toContain('kbar-command-menu-description')
    expect(searchInput.getAttribute('aria-describedby')).toContain('kbar-results-status')

    await waitFor(() => {
      expect(screen.getByRole('listbox').getAttribute('aria-label')).toBe('Search results')
    })
  })
})
