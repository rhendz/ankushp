import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import KBarButton from './kbar-button'

const mocks = vi.hoisted(() => ({
  toggle: vi.fn(),
  visualState: 'hidden',
}))

vi.mock('kbar', () => ({
  VisualState: {
    hidden: 'hidden',
  },
  useKBar: (collector?: (state: { visualState: string }) => Record<string, unknown>) => ({
    query: { toggle: mocks.toggle },
    ...(collector ? collector({ visualState: mocks.visualState }) : {}),
  }),
}))

describe('KBarButton', () => {
  afterEach(() => {
    cleanup()
    mocks.toggle.mockReset()
    mocks.visualState = 'hidden'
  })

  it('exposes accessible trigger semantics and toggles the menu on click', () => {
    render(<KBarButton />)

    const trigger = screen.getByRole('button', { name: 'Open command menu' })

    expect(trigger.getAttribute('type')).toBe('button')
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-controls')).toBe('kbar-search-dialog')

    fireEvent.click(trigger)

    expect(mocks.toggle).toHaveBeenCalledTimes(1)
  })

  it('reflects expanded state when the command menu is open', () => {
    mocks.visualState = 'showing'

    render(<KBarButton />)

    expect(
      screen.getByRole('button', { name: 'Open command menu' }).getAttribute('aria-expanded')
    ).toBe('true')
  })
})
