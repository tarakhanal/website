'use client';

import { ReactNode } from 'react';

// Pure pass-through — no blank-div wrapper needed.
// All pages are 'use client' and handle their own state via useEffect.
// The site uses output:'export' (static), so any server-render blanking causes
// a visible flash on Safari. Just render children directly.
export default function ClientShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
