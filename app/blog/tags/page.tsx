import Link from "@/components/link";
import Tag from "@/components/tag";
import { slug } from "github-slugger";
import tagData from "app/blog/tag-data.json";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({
  title: "Tags",
  description: "Things I blog about",
});

export default async function Page() {
  const tagCounts = tagData as Record<string, number>;
  const tagKeys = Object.keys(tagCounts);
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a]);
  return (
    <>
      <div className="flex flex-col items-start justify-start divide-y divide-secondary/30 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0">
        <div className="space-x-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 md:border-secondary/30">
            Tags
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {tagKeys.length === 0 && "No tags found."}
          {sortedTags.map((t) => {
            return (
              <div key={t} className="mb-2 mr-5 mt-2">
                <Tag text={t} />
                <Link
                  href={`/blog/tags/${slug(t)}`}
                  className="-ml-2 text-sm font-semibold uppercase text-secondary/70"
                  aria-label={`View posts tagged ${t}`}
                >
                  {` (${tagCounts[t]})`}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
