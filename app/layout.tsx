import '@/app/globals.css';

import { fontMono, fontSans } from '@/app/fonts';
import { Metadata, Viewport } from 'next';

import Navbar from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Ankush Patel',
  description: 'Ankush Patel is a machine learning engineer with 5 years of experience.',
  icons: {
    icon: [
      {
        rel: "apple-touch-icon",
        url: '/apple-touch-icon.png',
        href: '/apple-touch-icon.png',
        sizes: '180x180',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/favicon-dark.ico',
        href: '/favicon-dark.ico',
        sizes: 'any',
      },
      {
        url: '/favicon-light.ico',
        href: '/favicon-light.ico',
        sizes: 'any',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1.0,
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "#e6e8e6" },
//     { media: "(prefers-color-scheme: dark)", color: "#171219" },
//   ],
// }

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

