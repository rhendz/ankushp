'use client'

import { useState } from 'react'
import ClapButton from '@/components/clap-button'
import { Check, Link2 } from 'lucide-react'

export default function PostEngagementRail({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const onCopyLink = async () => {
    const markCopied = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }

    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if (!url) {
        return
      }
      await navigator.clipboard.writeText(url)
      markCopied()
    } catch {
      markCopied()
    }
  }

  return (
    <div className="not-prose flex justify-center" data-testid="engagement-rail">
      <div className="flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/[0.03] px-2.5 py-1">
        <ClapButton slug={slug} />
        <div className="h-4 w-px bg-secondary/20" />
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-secondary/75 transition hover:bg-secondary/10 hover:text-secondary"
          data-testid="copy-link-button"
          aria-label={copied ? 'Link copied' : 'Copy post link'}
          title={copied ? 'Copied' : 'Copy link'}
        >
          {copied ? <Check size={16} /> : <Link2 size={16} />}
        </button>
      </div>
    </div>
  )
}
