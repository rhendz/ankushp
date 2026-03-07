// noinspection TypeScriptMissingConfigOption

import { useEffect } from 'react'
import {
  KBarPortal,
  KBarSearch,
  KBarAnimator,
  KBarPositioner,
  KBarResults,
  useMatches,
  Action,
  useRegisterActions,
} from 'kbar'
import {
  KBAR_DIALOG_DESCRIPTION_ID,
  KBAR_DIALOG_ID,
  KBAR_DIALOG_LABEL_ID,
  KBAR_SEARCH_LABEL,
} from './constants'

const SEARCH_INPUT_ID = 'kbar-search-input'
const SEARCH_INPUT_LABEL_ID = 'kbar-search-input-label'
const RESULTS_STATUS_ID = 'kbar-results-status'
const RESULTS_LABEL = 'Search results'

export const KBarModal = ({ actions, isLoading }: { actions: Action[]; isLoading: boolean }) => {
  useRegisterActions(actions, [actions])

  return (
    <KBarPortal>
      <KBarPositioner
        data-testid="kbar-positioner"
        className="bg-primary/50 p-4 backdrop-blur backdrop-filter"
      >
        <KBarAnimator className="w-full max-w-xl">
          <div
            id={KBAR_DIALOG_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby={KBAR_DIALOG_LABEL_ID}
            aria-describedby={`${KBAR_DIALOG_DESCRIPTION_ID} ${RESULTS_STATUS_ID}`}
            className="overflow-hidden rounded-2xl border border-secondary/20 bg-primary/70"
          >
            <h2 id={KBAR_DIALOG_LABEL_ID} className="sr-only">
              Command menu
            </h2>
            <p id={KBAR_DIALOG_DESCRIPTION_ID} className="sr-only">
              Type to search commands and content. Use the arrow keys to move through results, Enter
              to open the selected result, and Escape to close the menu.
            </p>
            <ResultsStatus isLoading={isLoading} />
            <div className="flex items-center space-x-4 p-4">
              <span className="block w-5">
                <svg
                  className="text-secondary/70"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <label id={SEARCH_INPUT_LABEL_ID} htmlFor={SEARCH_INPUT_ID} className="sr-only">
                Search commands
              </label>
              <KBarSearch
                id={SEARCH_INPUT_ID}
                data-testid="kbar-search-input"
                aria-label={KBAR_SEARCH_LABEL}
                aria-labelledby={SEARCH_INPUT_LABEL_ID}
                aria-describedby={`${KBAR_DIALOG_DESCRIPTION_ID} ${RESULTS_STATUS_ID}`}
                className="h-8 w-full border-none border-transparent bg-transparent text-secondary placeholder-secondary/50 outline-none focus:ring-2 focus:ring-accent/70"
              />
              <kbd
                aria-hidden="true"
                className="inline-block whitespace-nowrap rounded border border-secondary/70 px-1.5 align-middle text-xs font-medium leading-4 tracking-wide text-secondary/70"
              >
                ESC
              </kbd>
            </div>
            {!isLoading && <RenderResults />}
            {isLoading && (
              <div className="block border-t border-secondary/10 px-4 py-8 text-center text-secondary/50">
                Loading...
              </div>
            )}
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

const ResultsStatus = ({ isLoading }: { isLoading: boolean }) => {
  const { results } = useMatches()

  return (
    <p id={RESULTS_STATUS_ID} className="sr-only" aria-live="polite">
      {isLoading
        ? 'Loading search results.'
        : results.length === 1
          ? '1 result available.'
          : `${results.length} results available.`}
    </p>
  )
}

const RenderResults = () => {
  const { results } = useMatches()

  useEffect(() => {
    const listbox = document.getElementById('kbar-listbox')

    if (!listbox) {
      return
    }

    listbox.setAttribute('aria-label', RESULTS_LABEL)
  }, [results])

  if (results.length) {
    return (
      <KBarResults
        items={results}
        onRender={({ item, active }) => (
          <div>
            {typeof item === 'string' ? (
              <div className="pt-3">
                <div className="block border-t border-secondary/20 px-4 pb-2 pt-6 text-xs font-semibold uppercase text-accent">
                  {item}
                </div>
              </div>
            ) : (
              <div
                className={`flex cursor-pointer justify-between px-4 py-2 ${
                  active ? 'bg-accent/70 text-secondary' : 'bg-transparent text-secondary/50'
                }`}
              >
                <div className={'flex space-x-2'}>
                  {item.icon && <div className={'self-center'}>{item.icon}</div>}
                  <div className="block">
                    {item.subtitle && (
                      <div
                        className={`${active ? 'text-secondary/70' : 'text-secondary/50'} text-xs`}
                      >
                        {item.subtitle}
                      </div>
                    )}
                    <div>{item.name}</div>
                  </div>
                </div>
                {item.shortcut?.length ? (
                  <div aria-hidden className="flex flex-row items-center justify-center gap-x-2">
                    {item.shortcut.map((sc) => (
                      <kbd
                        key={sc}
                        className={`flex h-7 w-6 items-center justify-center	rounded border text-xs font-medium ${
                          active
                            ? 'border-secondary/30 text-secondary/30'
                            : 'border-secondary/50 text-secondary/50'
                        }`}
                      >
                        {sc}
                      </kbd>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      />
    )
  } else {
    return (
      <div className="block border-t border-secondary/20 px-4 py-8 text-center text-secondary/50">
        No results for your search...
      </div>
    )
  }
}
