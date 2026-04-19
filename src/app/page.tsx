import { Suspense } from 'react';
import EnvelopeLanding from '@/components/EnvelopeLanding';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-[#F5E6E0] to-[#E8D5CC]" />}>
      <EnvelopeLanding />
    </Suspense>
  );
}

