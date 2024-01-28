import "./globals.css";

import { fontMono, fontSans } from "./fonts";
import { Metadata } from "next";

import Navbar from "@/components/navbar";
import { Providers } from "./providers";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "Ankush Patel",
  description:
    "Ankush Patel is a machine learning engineer with 5 years of experience.",
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
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body>
        <Providers>
          <div className="mx-auto flex flex-col min-h-screen justify-normal font-sans">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
