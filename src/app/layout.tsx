import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { Providers } from './providers';
import '@/app/globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Y & H',
  description: "Yeabkal and Hirut's Wedding Invitation",
  authors: [{ name: 'Yeabkal & Hirut' }],
  openGraph: {
    title: 'Y & H',
    description: "Yeabkal and Hirut's Wedding Invitation",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
