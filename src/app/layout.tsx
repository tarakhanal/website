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
        <style>{`
          html, body { scrollbar-width: none; -ms-overflow-style: none; }
          html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; }
        `}</style>
      </head>
      <body className="min-h-screen bg-[#F7F3EE] overflow-x-hidden">
        <HeartClickEffect />
        {children}
      </body>
    </html>
  );
}
