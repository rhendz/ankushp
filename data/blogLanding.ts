export type BlogLandingLink = {
  title: string
  href: string
  description: string
}

export type BlogLandingTag = {
  label: string
  href: string
}

export const blogLandingConfig: {
  startHere: BlogLandingLink[]
  popularTags: BlogLandingTag[]
} = {
  startHere: [
    {
      title: 'The Missing Layer in Your AI Stack: Intermediate Knowledge',
      href: '/blog/posts/the-missing-layer-in-your-ai-stack-intermediate-knowledge',
      description: 'Why intermediate representations are critical for practical AI systems.',
    },
    {
      title: 'The MLOps Engineer: Bridging ML and Product',
      href: '/blog/posts/the-mlops-engineer-bridging-the-gap-between-machine-learning-and-product',
      description: 'A practical look at shipping reliable machine learning in production.',
    },
    {
      title: 'Accelerating Your Python Projects with Poetry',
      href: '/blog/posts/accelerating-your-python-projects-with-poetry',
      description: 'A lightweight guide to dependency management and reproducible workflows.',
    },
  ],
  popularTags: [
    { label: 'tools', href: '/blog/tags/tools' },
    { label: 'mlops', href: '/blog/tags/mlops' },
    { label: 'machine-learning', href: '/blog/tags/machine-learning' },
  ],
}
