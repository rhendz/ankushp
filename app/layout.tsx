import { fontMono, fontSans } from '@/app/fonts';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ankush Patel',
  description: 'Ankush Patel is a machine learning engineer with 5 years of experience.',
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-icon.png',
      href: '/apple-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'icon',
      url: '/favicon-light.ico',
      href: '/favicon-light.ico',
      sizes: 'any',
      media: '(prefers-color-scheme: light)',
    },
    {
      rel: 'icon',
      url: '/favicon-dark.ico',
      href: '/favicon-dark.ico',
      sizes: 'any',
      media: '(prefers-color-scheme: dark)',
    },
  ],
  manifest: '/site.webmanifest',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='en' className={`${fontSans.variable} ${fontMono.variable} bg-background text-content`}>
      <ThemeProvider>
        <body>{children}</body>
      </ThemeProvider>
    </html>
  );
}

