'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'

type ViewState = 'idle' | 'success' | 'error' | 'missing-config'

const supportedProviders = new Set([
  'buttondown',
  'convertkit',
  'klaviyo',
  'mailchimp',
  'revue',
  'emailoctopus',
])

const defaultErrorMessage = 'Unable to subscribe right now. Please try again later.'
const defaultMissingConfigMessage =
  'Newsletter subscriptions are temporarily unavailable. You can still read all posts.'
const emailValidationMessage = 'Please enter a valid email address (for example, name@example.com).'

interface NewsletterStatusResponse {
  configured?: boolean
  message?: string
}

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

interface NewsletterCtaProps {
  title?: string
  description?: string
  className?: string
}

export default function NewsletterCta({
  title = 'Subscribe to the newsletter',
  description = 'Get new posts and practical AI notes in your inbox.',
  className = '',
}: NewsletterCtaProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')

  const provider = siteMetadata.newsletter?.provider
  const hasConfiguredProvider = Boolean(provider && supportedProviders.has(provider))
  const isMissingConfig = viewState === 'missing-config' || !hasConfiguredProvider

  useEffect(() => {
    if (!hasConfiguredProvider) {
      setViewState('missing-config')
      setFeedbackMessage(defaultMissingConfigMessage)
      return
    }

    let ignore = false
    const getStatus = async () => {
      try {
        const response = await fetch('/api/newsletter', { method: 'GET' })
        const data = await parseJsonSafely<NewsletterStatusResponse>(response)

        if (!ignore && data?.configured === false) {
          setViewState('missing-config')
          setFeedbackMessage(data.message || defaultMissingConfigMessage)
        }
      } catch {
        // Keep form usable if status check fails and rely on submit result.
      }
    }

    getStatus()

    return () => {
      ignore = true
    }
  }, [hasConfiguredProvider])

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const email = inputRef.current?.value.trim() || ''

    if (isMissingConfig || !email) {
      return
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValidEmail) {
      setValidationMessage(emailValidationMessage)
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setValidationMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      })

      const data = await parseJsonSafely<{ error?: string; message?: string; code?: string }>(
        response
      )

      if (!response.ok || data?.error) {
        if (data?.code === 'NEWSLETTER_NOT_CONFIGURED') {
          setViewState('missing-config')
          setFeedbackMessage(data?.error || defaultMissingConfigMessage)
        } else {
          setViewState('error')
          setFeedbackMessage(data?.error || defaultErrorMessage)
        }
        return
      }

      if (inputRef.current) {
        inputRef.current.value = ''
      }
      setViewState('success')
      setFeedbackMessage(data?.message || 'Thanks for subscribing.')
      router.push('/newsletter/success')
    } catch {
      setViewState('error')
      setFeedbackMessage(defaultErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const disableForm = isSubmitting || viewState === 'success' || isMissingConfig

  return (
    <div
      className={`mx-auto w-full max-w-4xl rounded-2xl border border-secondary/30 bg-secondary/5 p-6 ${className}`.trim()}
    >
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-secondary">{title}</h2>
        <p className="mt-2 text-sm text-secondary/70">{description}</p>
      </div>

      <form
        className="mt-4 flex w-full max-w-2xl flex-col gap-3 md:flex-row md:items-center"
        onSubmit={subscribe}
        noValidate
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          ref={inputRef}
          type="email"
          name="email"
          autoComplete="email"
          required
          disabled={disableForm}
          readOnly={disableForm}
          aria-disabled={disableForm}
          aria-invalid={Boolean(validationMessage)}
          placeholder={viewState === 'success' ? 'Subscribed' : 'Enter your email'}
          className="w-full rounded-md border border-secondary/30 bg-secondary/5 px-4 py-2.5 text-secondary caret-accent placeholder:text-secondary/45 focus:border-accent focus:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:border-secondary/20 disabled:bg-secondary/10 disabled:text-secondary/50 disabled:opacity-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-500/50 md:flex-1"
        />
        <button
          type="submit"
          disabled={disableForm}
          aria-disabled={disableForm}
          className="min-w-[10rem] rounded-md bg-accent px-5 py-2.5 font-semibold text-white transition hover:bg-accent/80 disabled:cursor-not-allowed disabled:bg-secondary/20 disabled:text-secondary/50 disabled:opacity-100"
        >
          {viewState === 'success'
            ? 'Subscribed'
            : isMissingConfig
              ? 'Unavailable'
              : isSubmitting
                ? 'Subscribing...'
                : 'Subscribe'}
        </button>
      </form>

      {(validationMessage || viewState !== 'idle') && (
        <p className="mt-3 text-sm text-secondary/80" aria-live="polite">
          {validationMessage && validationMessage}
          {viewState === 'success' && feedbackMessage}
          {viewState === 'error' && `Subscription failed: ${feedbackMessage}`}
          {viewState === 'missing-config' && feedbackMessage}
        </p>
      )}
    </div>
  )
}
