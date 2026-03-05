import Link from '@/components/link'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

export type RelatedPost = Pick<CoreContent<Blog>, 'slug' | 'title'>

interface RelatedPostsProps {
  posts: RelatedPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="border-t border-secondary/30 py-6">
      <h2 className="text-xs uppercase tracking-wide text-secondary/70">Related Posts</h2>
      <ul className="mt-4 space-y-3 text-sm font-medium leading-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/posts/${post.slug}`} className="text-accent hover:text-accent/70">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
