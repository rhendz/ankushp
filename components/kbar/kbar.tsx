import { useState, useEffect, FC, ReactNode, useRef } from 'react'
import type { Action } from 'kbar'
import { KBarProvider } from 'kbar'
import { useRouter } from 'next/navigation.js'
import { KBarModal } from './kbar-modal'
import { CoreContent, MDXDocument } from '../utils/contentlayer'
import { formatDate } from '../utils/formate-date'

export interface KBarSearchProps {
  searchDocumentsPath: string | false
  defaultActions?: Action[]
  onSearchDocumentsLoad?: (json: unknown) => Action[]
}

export interface KBarConfig {
  provider: 'kbar'
  kbarConfig: KBarSearchProps
}

/**
 * Command palette like search component with kbar - `ctrl-k` to open the palette.
 *
 * Default actions can be overridden by passing in an array of actions to `defaultActions`.
 * To load actions dynamically, pass in a `searchDocumentsPath` to a JSON file.
 * `onSearchDocumentsLoad` can be used to transform the JSON into actions.
 *
 * To toggle the modal or search from child components, use the search context:
 * ```
 * import { useKBar } from 'kbar'
 * const { query } = useKBar()
 * ```
 * See https://github.com/timc1/kbar/blob/main/src/types.ts#L98-L106 for typings.
 *
 * @param {*} { kbarConfig, children }
 * @return {*}
 */
export const KBarSearchProvider: FC<{
  children: ReactNode
  kbarConfig: KBarSearchProps
}> = ({ kbarConfig, children }) => {
  const router = useRouter()
  const { searchDocumentsPath, defaultActions, onSearchDocumentsLoad } = kbarConfig
  const [searchActions, setSearchActions] = useState<Action[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const previousFocusedElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const isSearchDocumentArray = (value: unknown): value is CoreContent<MDXDocument>[] => {
      if (!Array.isArray(value)) {
        return false
      }

      return value.every((item) => {
        if (typeof item !== 'object' || item === null) {
          return false
        }

        const candidate = item as Partial<CoreContent<MDXDocument>>
        return (
          typeof candidate.path === 'string' &&
          typeof candidate.title === 'string' &&
          typeof candidate.date === 'string'
        )
      })
    }

    const mapPosts = (posts: CoreContent<MDXDocument>[]) => {
      const actions: Action[] = []
      for (const post of posts) {
        const postIndex = post.path.indexOf('/')

        actions.push({
          id: post.path,
          name: post.title,
          keywords: post?.summary || '',
          section: 'Content',
          subtitle: formatDate(post.date, 'en-US'),
          perform: () => router.push('/blog/posts/' + post.path.slice(postIndex + 1)),
        })
      }
      return actions
    }
    async function fetchData() {
      if (searchDocumentsPath) {
        const url =
          searchDocumentsPath.indexOf('://') > 0 || searchDocumentsPath.indexOf('//') === 0
            ? searchDocumentsPath
            : new URL(searchDocumentsPath, window.location.origin)
        try {
          const res = await fetch(url)
          if (!res.ok) {
            setSearchActions([])
            setDataLoaded(true)
            return
          }

          const contentType = res.headers.get('content-type') || ''
          if (!contentType.includes('application/json')) {
            setSearchActions([])
            setDataLoaded(true)
            return
          }

          const json: unknown = await res.json()
          const actions = onSearchDocumentsLoad
            ? onSearchDocumentsLoad(json)
            : isSearchDocumentArray(json)
              ? mapPosts(json)
              : []
          setSearchActions(actions)
        } catch (error) {
          // If search documents are unavailable (e.g. missing search.json in dev), keep UI functional.
          console.warn('KBar search documents could not be loaded.', error)
          setSearchActions([])
        } finally {
          setDataLoaded(true)
        }
      }
    }
    if (!dataLoaded && searchDocumentsPath) {
      fetchData()
    } else {
      setDataLoaded(true)
    }
  }, [defaultActions, dataLoaded, router, searchDocumentsPath, onSearchDocumentsLoad])

  const handleOpen = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      previousFocusedElementRef.current = document.activeElement
    }
  }

  const handleClose = () => {
    if (previousFocusedElementRef.current?.isConnected) {
      previousFocusedElementRef.current.focus()
    }
    previousFocusedElementRef.current = null
  }

  return (
    <KBarProvider
      actions={defaultActions}
      options={{
        callbacks: {
          onOpen: handleOpen,
          onClose: handleClose,
        },
      }}
    >
      <KBarModal actions={searchActions} isLoading={!dataLoaded} />
      {children}
    </KBarProvider>
  )
}
