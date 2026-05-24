import type { Metadata, Viewport } from 'next';
import './globals.css';
import HeartClickEffect from '@/components/HeartClickEffect';

export const metadata: Metadata = {
  title: 'Tara & Bandana - Wedding',
  description: 'Join us for our wedding celebration on April 24, 2027',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8B7355',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#FAFAF8]">
        <HeartClickEffect />
        {children}
      </body>
    </html>
  );
}
