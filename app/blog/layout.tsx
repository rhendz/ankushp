import "css/tailwind.css";

import { Metadata } from "next";
import siteMetadata from "@/data/siteMetadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: "Blog",
    template: `%s | ${siteMetadata.title}`,
  },
  description:
    "Notes from an AI Engineer working on backend and systems: AI engineering, product thinking, and the systems behind reliable software.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col justify-between font-sans">
      <main className="mb-auto">{children}</main>
    </div>
  );
}
