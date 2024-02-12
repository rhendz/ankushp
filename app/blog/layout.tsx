import "css/tailwind.css";

import { Metadata } from "next";
import siteMetadata from "@/data/siteMetadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: "Blog",
    template: `%s | ${siteMetadata.title}`,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex antialiased">
      <div className="flex flex-col mx-auto justify-between font-sans">
        <main className="mb-auto">{children}</main>
      </div>
    </div>
  );
}
