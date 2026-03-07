import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import type { Action } from 'kbar'
import { KBarSearchProvider } from './kbar'

type ModalSnapshot = {
  actions: Action[]
  isLoading: boolean
}

const mocks = vi.hoisted(() => ({
  modalSnapshots: [] as ModalSnapshot[],
  push: vi.fn(),
}))

vi.mock('next/navigation.js', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('kbar', () => ({
  KBarProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('./kbar-modal', () => ({
  KBarModal: ({ actions, isLoading }: ModalSnapshot) => {
    mocks.modalSnapshots.push({ actions: [...actions], isLoading })
    return <div data-testid="kbar-modal" />
  },
}))

const getLatestModalSnapshot = () => {
  const latestSnapshot = mocks.modalSnapshots.at(-1)

  if (!latestSnapshot) {
    throw new Error('KBarModal was never rendered.')
  }

  return latestSnapshot
}

describe('KBarSearchProvider fetch resilience', () => {
  beforeEach(() => {
    mocks.modalSnapshots.length = 0
    mocks.push.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('falls back gracefully when search fetch returns non-OK response', async () => {
    const json = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      headers: { get: vi.fn() },
      json,
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <KBarSearchProvider kbarConfig={{ searchDocumentsPath: '/search.json' }}>
        <div>kbar child</div>
      </KBarSearchProvider>
    )

    await waitFor(() => {
      expect(getLatestModalSnapshot().isLoading).toBe(false)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(json).not.toHaveBeenCalled()
    expect(getLatestModalSnapshot().actions).toEqual([])
    expect(screen.getByTestId('kbar-modal')).toBeTruthy()
  })

  it('falls back gracefully when response is not JSON', async () => {
    const json = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: vi.fn().mockReturnValue('text/plain') },
        json,
      })
    )

    render(
      <KBarSearchProvider kbarConfig={{ searchDocumentsPath: '/search.json' }}>
        <div>kbar child</div>
      </KBarSearchProvider>
    )

    await waitFor(() => {
      expect(getLatestModalSnapshot().isLoading).toBe(false)
    })

    expect(json).not.toHaveBeenCalled()
    expect(getLatestModalSnapshot().actions).toEqual([])
    expect(screen.getByTestId('kbar-modal')).toBeTruthy()
  })

  it('falls back gracefully when fetch throws an exception', async () => {
    const fetchError = new Error('network failed')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(fetchError))

    render(
      <KBarSearchProvider kbarConfig={{ searchDocumentsPath: '/search.json' }}>
        <div>kbar child</div>
      </KBarSearchProvider>
    )

    await waitFor(() => {
      expect(getLatestModalSnapshot().isLoading).toBe(false)
    })

    expect(getLatestModalSnapshot().actions).toEqual([])
    expect(warnSpy).toHaveBeenCalledWith('KBar search documents could not be loaded.', fetchError)
    expect(screen.getByTestId('kbar-modal')).toBeTruthy()
  })

  it('loads and applies actions on happy path JSON response', async () => {
    const responsePayload = [{ id: 'post-1', title: 'Post 1' }]
    const transformedActions: Action[] = [
      {
        id: 'post-1',
        name: 'Post 1',
        perform: vi.fn(),
      },
    ]
    const onSearchDocumentsLoad = vi.fn().mockReturnValue(transformedActions)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: vi.fn().mockReturnValue('application/json; charset=utf-8') },
        json: vi.fn().mockResolvedValue(responsePayload),
      })
    )

    render(
      <KBarSearchProvider
        kbarConfig={{
          searchDocumentsPath: '/search.json',
          onSearchDocumentsLoad,
        }}
      >
        <div>kbar child</div>
      </KBarSearchProvider>
    )

    await waitFor(() => {
      expect(getLatestModalSnapshot().isLoading).toBe(false)
    })

    expect(onSearchDocumentsLoad).toHaveBeenCalledWith(responsePayload)
    expect(getLatestModalSnapshot().actions).toEqual(transformedActions)
    expect(screen.getByTestId('kbar-modal')).toBeTruthy()
  })
})
