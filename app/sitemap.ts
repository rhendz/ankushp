import { MetadataRoute } from "next";
import { allBlogs } from "contentlayer/generated";
import siteMetadata from "@/data/siteMetadata";
import { slug } from "github-slugger";
import tagData from "app/blog/tag-data.json";

const POSTS_PER_PAGE = 5;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl;
  const today = new Date().toISOString().split("T")[0];

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/blog/posts/${post.slug}`,
      lastModified: post.lastmod || post.date,
    }));

  const tagCounts = tagData as Record<string, number>;
  const tagRoutes = Object.keys(tagCounts).map((tag) => ({
    url: `${siteUrl}/blog/tags/${slug(tag)}`,
    lastModified: today,
  }));

  const totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE);
  const paginatedPostRoutes = Array.from({ length: totalPages }, (_, i) => ({
    url: `${siteUrl}/blog/posts/page/${i + 1}`,
    lastModified: today,
  }));

  const routes = ["", "about", "blog", "blog/posts", "blog/tags"].map(
    (route) => ({
      url: `${siteUrl}/${route}`,
      lastModified: today,
    }),
  );

  return [...routes, ...blogRoutes, ...tagRoutes, ...paginatedPostRoutes];
}
