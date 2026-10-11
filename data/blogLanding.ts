export type BlogLandingLink = {
  title: string
  href: string
  description: string
}

export const blogLandingConfig: {
  startHere: BlogLandingLink[]
} = {
  startHere: [
    {
      title: 'How I Think About Reliability in Agentic Workflows',
      href: '/blog/posts/how-i-think-about-reliability-in-agentic-workflows',
      description: 'Designing for mistakes that are visible, bounded, and recoverable.',
    },
    {
      title: 'Tool Calling Is the Real Product Surface of AI Systems',
      href: '/blog/posts/tool-calling-is-the-real-product-surface-of-ai-systems',
      description:
        'Why tool boundaries and failure behavior shape the product people actually use.',
    },
    {
      title: 'Memory, State, and Skills Are Not the Same Thing',
      href: '/blog/posts/memory-state-and-skills-are-not-the-same-thing',
      description:
        'Three different jobs, and the architectural clarity that comes from separating them.',
    },
  ],
}
