import { Authors, allAuthors } from "contentlayer/generated";
import AuthorLayout from "@/layouts/author-layout";
import { coreContent } from "pliny/utils/contentlayer";
import { genPageMetadata } from "app/seo";
import MdxRenderContent from "@/components/mdx-render-content";

export const metadata = genPageMetadata({ title: "About" });
export const dynamic = "force-dynamic";

export default function Page() {
  const author = allAuthors.find((p) => p.slug === "default") as Authors;
  const mainContent = coreContent(author);

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MdxRenderContent code={author.body.code} />
      </AuthorLayout>
    </>
  );
}
