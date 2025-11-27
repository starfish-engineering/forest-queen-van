import type { Metadata } from 'next';
import { DM_Sans, Space_Mono, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/lib/providers';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CapEx Scout | NYC Investment Intelligence',
  description: 'Neighborhood investment intelligence for real estate investors. Track permit activity, business openings, and construction trends across NYC.',
  keywords: ['real estate', 'NYC', 'permits', 'investment', 'neighborhood analysis'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${dmSans.variable} ${spaceMono.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
