import siteMetadata from '@/data/siteMetadata'

export type NewsletterProvider =
  | 'buttondown'
  | 'beehiiv'
  | 'convertkit'
  | 'klaviyo'
  | 'mailchimp'
  | 'emailoctopus'

const requiredEnvByProvider: Record<NewsletterProvider, string[]> = {
  buttondown: ['BUTTONDOWN_API_KEY'],
  beehiiv: ['BEEHIIV_API_KEY', 'BEEHIIV_PUBLICATION_ID'],
  convertkit: ['CONVERTKIT_API_KEY', 'CONVERTKIT_FORM_ID'],
  klaviyo: ['KLAVIYO_API_KEY', 'KLAVIYO_LIST_ID'],
  mailchimp: ['MAILCHIMP_API_KEY', 'MAILCHIMP_API_SERVER', 'MAILCHIMP_AUDIENCE_ID'],
  emailoctopus: ['EMAILOCTOPUS_API_KEY', 'EMAILOCTOPUS_LIST_ID'],
}

const providers = new Set<NewsletterProvider>(
  Object.keys(requiredEnvByProvider) as NewsletterProvider[]
)

function toNewsletterProvider(value: unknown): NewsletterProvider | null {
  if (typeof value !== 'string') {
    return null
  }

  return providers.has(value as NewsletterProvider) ? (value as NewsletterProvider) : null
}

export function getNewsletterProvider(): NewsletterProvider | null {
  return toNewsletterProvider(siteMetadata.newsletter?.provider)
}

export function getMissingNewsletterEnvVars(provider: NewsletterProvider): string[] {
  return requiredEnvByProvider[provider].filter((envVar) => !process.env[envVar])
}

export function getNewsletterStatus() {
  const provider = getNewsletterProvider()

  if (!provider) {
    return {
      configured: false,
      provider: null,
      missingEnvVars: [] as string[],
    }
  }

  const missingEnvVars = getMissingNewsletterEnvVars(provider)

  return {
    configured: missingEnvVars.length === 0,
    provider,
    missingEnvVars,
  }
}
