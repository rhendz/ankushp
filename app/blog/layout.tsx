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
    // <html
    //   lang={siteMetadata.language}
    //   className={`${space_grotesk.variable} scroll-smooth`}
    //   suppressHydrationWarning
    // >
    //   <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
    //   <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png" />
    //   <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png" />
    //   <link rel="manifest" href="/static/favicons/site.webmanifest" />
    //   <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#5bbad5" />
    //   <meta name="msapplication-TileColor" content="#000000" />
    //   <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
    //   <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
    //   <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
    <div className="flex-1 flex antialiased">
      <div className="flex flex-col mx-auto justify-between font-sans">
        <main className="mb-auto">{children}</main>
      </div>
    </div>
    // </html>
  );
}
