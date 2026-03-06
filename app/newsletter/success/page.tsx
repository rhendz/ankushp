import Link from "@/components/link";
import SectionContainer from "@/components/section-container";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Subscribed" });

export default function Page() {
  return (
    <SectionContainer>
      <div className="mx-auto my-16 w-full max-w-2xl rounded-2xl border border-secondary/30 bg-secondary/5 p-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl">
          You&apos;re in.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-secondary/75 sm:text-lg">
          You&apos;re subscribed to practical AI notes, workflows, and tools.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/blog"
            className="rounded-md bg-accent px-5 py-2.5 font-semibold text-white transition hover:bg-accent/80"
          >
            Back to Blog
          </Link>
          <Link
            href="/blog/posts"
            className="rounded-md border border-secondary/30 px-5 py-2.5 font-semibold text-secondary transition hover:bg-secondary/10"
          >
            Browse Posts
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
