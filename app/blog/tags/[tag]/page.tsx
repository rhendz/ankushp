import { slug } from "github-slugger";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import siteMetadata from "@/data/siteMetadata";
import ListLayout from "@/layouts/list-layout-with-tags";
import { allBlogs } from "contentlayer/generated";
import tagData from "app/blog/tag-data.json";
import { genPageMetadata } from "app/seo";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const tag = decodeURI(resolvedParams.tag);
  const tagUrl = `${siteMetadata.siteUrl}/blog/tags/${encodeURI(tag)}`;

  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    openGraph: {
      title: `${tag} | ${siteMetadata.title}`,
      description: `${siteMetadata.title} ${tag} tagged content`,
      url: tagUrl,
      siteName: siteMetadata.title,
      images: [siteMetadata.socialBanner],
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: tagUrl,
      types: {
        "application/rss+xml": `${siteMetadata.siteUrl}/blog/tags/${tag}/feed.xml`,
      },
    },
  });
}

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>;
  const tagKeys = Object.keys(tagCounts);
  const paths = tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }));
  return paths;
};

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const resolvedParams = await params;
  const tag = decodeURI(resolvedParams.tag);
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(" ").join("-").slice(1);
  const filteredPosts = allCoreContent(
    sortPosts(
      allBlogs.filter(
        (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag),
      ),
    ),
  );
  return <ListLayout posts={filteredPosts} title={title} />;
}
