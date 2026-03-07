'use client'

import React, { useEffect } from 'react'
import mermaid from 'mermaid'

type MermaidProps = {
  readonly chart: string
}

const resolveDarkMode = (): boolean => {
  const forcedTheme = document.documentElement.getAttribute('data-theme')
  if (forcedTheme === 'dark') return true
  if (forcedTheme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const initializeMermaid = () => {
  const isDark = resolveDarkMode()
  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
      background: 'transparent',
      primaryColor: isDark ? '#2f2a3a' : '#f3f4f6',
      primaryTextColor: isDark ? '#f5fbef' : '#011627',
      primaryBorderColor: isDark ? '#5d5766' : '#9ca3af',
      lineColor: isDark ? '#c7ced9' : '#4b5563',
      secondaryColor: isDark ? '#3a3445' : '#e5e7eb',
      tertiaryColor: isDark ? '#474058' : '#e5e7eb',
    },
    flowchart: {
      htmlLabels: true,
    },
  })
}

const Mermaid = ({ chart }: MermaidProps): JSX.Element => {
  useEffect(() => {
    initializeMermaid()
    mermaid.contentLoaded()

    const observer = new MutationObserver(() => {
      initializeMermaid()
      mermaid.contentLoaded()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  return <div className="mermaid w-full">{chart}</div>
}

export default Mermaid
