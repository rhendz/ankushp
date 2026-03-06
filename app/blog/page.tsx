import Link from "@/components/link";
import Tag from "@/components/tag";
import siteMetadata from "@/data/siteMetadata";
import { blogLandingConfig } from "@/data/blogLanding";
import { allBlogs } from "contentlayer/generated";
import { sortPosts, allCoreContent } from "pliny/utils/contentlayer";
import { formatDate } from "pliny/utils/formatDate";
import NewsletterCta from "@/components/newsletter-cta";

const MAX_DISPLAY = 5;

const BlogHome = ({ posts }) => {
  return (
    <>
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Hi, I'm Ankush Patel
        </h1>
        <p className="text-lg leading-7 text-secondary/60">
          Welcome to my blog, where curiosity drives exploration and passion
          sparks discovery! 🚀 Join me in navigating the dynamic world of
          technology, from exploring the latest AI advancements to unraveling
          fascinating tech innovations. Whether you're here to delve into
          insights or to savor everyday wonders, welcome aboard!
        </p>
      </div>
      <div className="divide-y divide-secondary/30">
        <div className="space-y-7 pb-10 pt-7">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold leading-8 tracking-tight">
              Start Here
            </h2>
            <ul className="grid gap-3">
              {blogLandingConfig.startHere.map((item, index) => (
                <li
                  key={item.href}
                  className="group rounded-xl border border-secondary/20 bg-gradient-to-r from-secondary/[0.08] to-secondary/[0.03] p-4 transition hover:border-accent/40 hover:from-secondary/[0.12] hover:to-secondary/[0.06]"
                >
                  <Link
                    href={item.href}
                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
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
              {blogLandingConfig.popularTags.map((tag) => (
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
