import Link from "@/components/link";
import Tag from "@/components/tag";
import siteMetadata from "@/data/siteMetadata";
import { blogLandingConfig } from "@/data/blogLanding";
import tagData from "app/blog/tag-data.json";
import { allBlogs } from "contentlayer/generated";
import { sortPosts, allCoreContent } from "pliny/utils/contentlayer";
import { formatDate } from "pliny/utils/formatDate";
import NewsletterCta from "@/components/newsletter-cta";

const MAX_DISPLAY = 5;
const MAX_POPULAR_TAGS = 5;
const START_HERE_FALLBACK_COUNT = 3;

const BlogHome = ({ posts }) => {
  const knownPostHrefs = new Set(
    posts.map((post) => `/blog/posts/${post.slug}`),
  );
  const curatedStartHere = blogLandingConfig.startHere.filter((item) =>
    knownPostHrefs.has(item.href),
  );
  const startHereItems =
    curatedStartHere.length > 0
      ? curatedStartHere
      : posts.slice(0, START_HERE_FALLBACK_COUNT).map((post) => ({
          title: post.title,
          href: `/blog/posts/${post.slug}`,
          description: post.summary ?? "",
        }));

  const tagCounts = tagData as Record<string, number>;
  const popularTags = Object.keys(tagCounts)
    .sort((a, b) => tagCounts[b] - tagCounts[a])
    .slice(0, MAX_POPULAR_TAGS)
    .map((tag) => ({ label: tag, href: `/blog/tags/${tag}` }));

  return (
    <>
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Hi, I'm Ankush Patel
        </h1>
        <p className="text-lg leading-7 text-secondary/60">
          I write about AI engineering, product thinking, and the systems behind
          reliable software. If you're building with AI or just curious about
          what actually works in practice, you're in the right place 🚀
        </p>
      </div>
      <div className="divide-y divide-secondary/30">
        <div className="space-y-7 pb-10 pt-7">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold leading-8 tracking-tight">
              Start Here
            </h2>
            <ul className="grid gap-3">
              {startHereItems.map((item, index) => (
                <li
                  key={item.href}
                  className="group rounded-xl border border-secondary/20 bg-gradient-to-r from-accent/[0.06] via-accent/[0.03] to-transparent p-4 transition hover:border-accent/40 hover:from-accent/[0.1] hover:via-accent/[0.05] dark:from-secondary/[0.08] dark:via-secondary/[0.06] dark:to-secondary/[0.03] dark:hover:from-secondary/[0.12] dark:hover:via-secondary/[0.1] dark:hover:to-secondary/[0.06]"
                >
                  <Link
                    href={item.href}
                    className="block rounded-lg text-secondary no-underline visited:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary/60">
                        {`0${index + 1}`}
                      </p>
                      <div className="flex-1">
                        <p className="text-base font-semibold leading-6 text-secondary/90 transition-colors group-hover:text-secondary group-focus-within:text-secondary">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-secondary/70">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-secondary/50 transition group-hover:text-accent">
                        &rarr;
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold leading-8 tracking-tight">
              Popular Tags
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {popularTags.map((tag) => (
                <Link
                  key={tag.href}
                  href={tag.href}
                  className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent transition hover:border-accent/40 hover:bg-accent/15"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Latest
          </h1>
        </div>
        <ul className="divide-y divide-secondary/30">
          {!posts.length && "No posts found."}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post;
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-secondary/60">
                        <time dateTime={date}>
                          {formatDate(date, siteMetadata.locale)}
                        </time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link href={`/blog/posts/${slug}`}>{title}</Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-secondary/70">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/blog/posts/${slug}`}
                          className="text-accent hover:text-accent/70"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog/posts"
            className="text-accent hover:text-accent/70"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      <div className="pt-10">
        <NewsletterCta />
      </div>
    </>
  );
};

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs);
  const posts = allCoreContent(sortedPosts);
  return <BlogHome posts={posts} />;
}
