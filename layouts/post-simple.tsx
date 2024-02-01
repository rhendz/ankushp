import { ReactNode } from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/comments'
import Link from '@/components/link'
import PageTitle from '@/components/page-title'
import SectionContainer from '@/components/section-container'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/scroll-top-and-comment'

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { slug: string; title: string }
  prev?: { slug: string; title: string }
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { path, slug, date, title } = content

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <header>
            <div className="space-y-1 border-b border-secondary/30 pb-10 text-center">
              <dl>
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base font-medium leading-6 text-secondary/70">
                    <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-secondary/30 pb-8 xl:divide-y-0">
            <div className="divide-y divide-secondary/30 xl:col-span-3 xl:row-span-2 xl:pb-0">
              <div className="prose max-w-none pb-8 pt-10">{children}</div>
            </div>
            {siteMetadata.comments && (
              <div className="py-6 text-center text-secondary/80" id="comment">
                <Comments slug={slug} />
              </div>
            )}
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.slug && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/blog/posts/${prev.slug}`}
                      className="text-accent hover:text-accent/70"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
                {next && next.slug && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/blog/posts/${next.slug}`}
                      className="text-accent hover:text-accent/70"
                      aria-label={`Next post: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
