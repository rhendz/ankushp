import ListLayout from "@/layouts/list-layout-with-tags";
import { allCoreContent, sortPosts } from "pliny/utils/contentlayer";
import { allBlogs } from "contentlayer/generated";
import { Metadata } from "next";
import siteMetadata from "@/data/siteMetadata";
import { genPageMetadata } from "app/seo";

const POSTS_PER_PAGE = 5;

export async function generateMetadata({
  params,
}: {
  params: { page: string };
}): Promise<Metadata> {
  const pageNumber = Number.parseInt(params.page, 10);
  const page = Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
  const pageUrl = `${siteMetadata.siteUrl}/blog/posts/page/${page}`;

  return genPageMetadata({
    title: `Posts - Page ${page}`,
    description: `Page ${page} of blog posts`,
    openGraph: {
      title: `Posts - Page ${page} | ${siteMetadata.title}`,
      description: `Page ${page} of blog posts`,
      url: pageUrl,
      siteName: siteMetadata.title,
      images: [siteMetadata.socialBanner],
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: pageUrl,
    },
  });
}

export const generateStaticParams = async () => {
  const totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE);
  const paths = Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString(),
  }));

  return paths;
};

export default function Page({ params }: { params: { page: string } }) {
  const posts = allCoreContent(sortPosts(allBlogs));
  const pageNumber = parseInt(params.page as string);
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber,
  );
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  };

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="All Posts"
    />
  );
}
