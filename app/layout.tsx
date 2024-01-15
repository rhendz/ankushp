import { fontMono, fontSans } from '@/app/fonts';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: 'Ankush Patel',
  description: 'Ankush Patel | ML Engineer in the Bay Area',
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
