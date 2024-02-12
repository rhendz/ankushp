import Link from "@/components/link";
import Tag from "@/components/tag";
import siteMetadata from "@/data/siteMetadata";
import { allBlogs } from "contentlayer/generated";
import { sortPosts, allCoreContent } from "pliny/utils/contentlayer";
import { formatDate } from "pliny/utils/formatDate";
import NewsletterForm from "pliny/ui/NewsletterForm";

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
          sparks discovery! 🚀 Join me in exploring the dynamic world of
          technology, from coding challenges to deep dives into AI. Whether
          you're here to delve into insights or to savor everyday wonders,
          welcome aboard!
        </p>
      </div>
      <div className="divide-y divide-secondary/30">
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
      {/* {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )} */}
    </>
  );
};

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs);
  const posts = allCoreContent(sortedPosts);
  return <BlogHome posts={posts} />;
}
