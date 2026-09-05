import siteMetadata from '@/data/siteMetadata'

/**
 * Post dates are calendar dates ("2024-03-18"), not instants. `new Date()`
 * parses those as UTC midnight, so formatting them in the viewer's local zone
 * shifts the day backwards for anyone west of UTC — the post reads a day early,
 * and because the list layouts are client components the server (UTC) and
 * client render different text, which React reports as hydration error #418.
 * Pinning the zone to UTC keeps the displayed date equal to the authored one
 * everywhere.
 */
export function formatDate(date: string, locale: string = siteMetadata.locale) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
