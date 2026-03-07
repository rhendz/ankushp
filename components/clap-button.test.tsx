import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ClapButton from './clap-button'

type ClapState = {
  configured: boolean
  total: number
  user: number
  cap: number
}

function createJsonResponse(body: Record<string, unknown>, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response
}

describe('ClapButton', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('batches queued likes into grouped POST requests', async () => {
    const postAmounts: number[] = []
    let postCallCount = 0
    let serverState: ClapState = {
      configured: true,
      total: 0,
      user: 0,
      cap: 50,
    }

    let resolveFirstPost: (() => void) | null = null
    const firstPostPromise = new Promise<Response>((resolve) => {
      resolveFirstPost = () => {
        const firstAmount = postAmounts[0] ?? 1
        serverState = {
          ...serverState,
          total: serverState.total + firstAmount,
          user: serverState.user + firstAmount,
        }
        resolve(createJsonResponse(serverState))
      }
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      const method = init?.method || 'GET'

      if (method === 'GET' && url.includes('/api/claps')) {
        return Promise.resolve(createJsonResponse(serverState))
      }

      if (method === 'POST' && url.includes('/api/claps')) {
        postCallCount += 1
        const body = JSON.parse(String(init?.body || '{}')) as { amount?: number }
        const amount = body.amount ?? 1
        postAmounts.push(amount)

        if (postCallCount === 1) {
          return firstPostPromise
        }

        serverState = {
          ...serverState,
          total: serverState.total + amount,
          user: serverState.user + amount,
        }
        return Promise.resolve(createJsonResponse(serverState))
      }

      throw new Error(`Unhandled fetch request: ${method} ${url}`)
    })

    render(<ClapButton slug="batched-like-post" />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/claps?slug=batched-like-post', {
        method: 'GET',
      })
    })

    const button = screen.getByTestId('like-button')

    for (let i = 0; i < 7; i += 1) {
      fireEvent.keyDown(button, { key: 'Enter' })
    }

    expect(postAmounts[0]).toBe(1)

    resolveFirstPost?.()

    await waitFor(() => {
      expect(postAmounts.length).toBeGreaterThan(1)
    })

    expect(postAmounts).toContain(5)

    await waitFor(() => {
      expect(screen.getByTestId('like-count').textContent).toBe('7')
    })
  })

  it('does not send POST requests when visitor has reached cap', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      const method = init?.method || 'GET'

      if (method === 'GET' && url.includes('/api/claps')) {
        return Promise.resolve(
          createJsonResponse({
            configured: true,
            total: 200,
            user: 50,
            cap: 50,
          })
        )
      }

      if (method === 'POST' && url.includes('/api/claps')) {
        return Promise.resolve(createJsonResponse({ error: 'should not happen' }, false))
      }

      throw new Error(`Unhandled fetch request: ${method} ${url}`)
    })

    render(<ClapButton slug="at-cap-post" />)

    await waitFor(() => {
      expect(screen.getByTestId('like-button').getAttribute('aria-pressed')).toBe('true')
    })

    const button = screen.getByTestId('like-button')
    fireEvent.keyDown(button, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByTestId('like-button').getAttribute('aria-label')).toBe(
        'Like limit reached (50)'
      )
    })

    const postCalls = fetchMock.mock.calls.filter(
      ([input, init]) => String(input).includes('/api/claps') && (init?.method || 'GET') === 'POST'
    )
    expect(postCalls).toHaveLength(0)
  })
})
