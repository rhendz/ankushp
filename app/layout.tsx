import '@/app/globals.css';

import { fontMono, fontSans } from '@/app/fonts';
import { Metadata, Viewport } from 'next';

import Navbar from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Ankush Patel',
  description: 'Ankush Patel is a machine learning engineer with 5 years of experience.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      {
        rel: 'icon',
        url: '/favicon.ico',
        href: '/favicon.ico',
        sizes: 'any',
      },
      {
        rel: 'icon',
        url: '/icon.svg',
        href: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: "apple-touch-icon",
        url: '/apple-touch-icon.png',
        href: '/apple-touch-icon.png',
      },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='en' className={`${fontSans.variable} ${fontMono.variable} bg-background text-content`}>
      <ThemeProvider>
        <body>
          <Navbar />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}

