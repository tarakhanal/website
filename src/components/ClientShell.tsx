'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Renders children client-side only — eliminates ALL hydration mismatches
// caused by framer-motion, localStorage, and other browser-only APIs.
// The loading fallback matches the page background so there is no visible flash.
const ClientOnly = dynamic(
  () => Promise.resolve(({ children }: { children: ReactNode }) => <>{children}</>),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: '100vh', background: '#FAFAF8' }} />,
  }
);

export default function ClientShell({ children }: { children: ReactNode }) {
  return <ClientOnly>{children}</ClientOnly>;
}
