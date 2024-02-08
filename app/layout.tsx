import "./globals.css";

import { fontMono, fontSans } from "./fonts";
import { Metadata } from "next";

import { Providers } from "./providers";
import Header from "@/components/header";
import SectionContainer from "@/components/section-container";
import Footer from "@/components/footer";

import siteMetadata from "@/data/siteMetadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: siteMetadata.siteUrl,
    types: {
      "application/rss+xml": `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: "summary_large_image",
    images: [siteMetadata.socialBanner],
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        rel: "icon",
        url: "/favicon.ico",
        href: "/favicon.ico",
        sizes: "any",
      },
      {
        rel: "icon",
        url: "/icon.svg",
        href: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        rel: "apple-touch-icon",
        url: "/apple-touch-icon.png",
        href: "/apple-touch-icon.png",
      },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-primary text-secondary">
        <Providers>
          <SectionContainer>
            <div className="flex h-screen flex-col justify-between font-sans">
              <Header />
              {children}
              <Footer />
            </div>
          </SectionContainer>
        </Providers>
      </body>
    </html>
  );
}
