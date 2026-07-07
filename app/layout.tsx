import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import GlobalModal from '@/components/globals/GlobalModal';
import GlobalSheet from '@/components/globals/GlobalSheet';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Design Studio - Minimal Canvas Editor',
  description: 'A beautiful minimal design editor for creating stunning visuals',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <GlobalModal />
        <GlobalSheet />
      </body>
    </html>
  );
}
