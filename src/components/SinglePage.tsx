'use client';

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { useAudioStore } from '@/store/audioStore';
import MusicToggle from '@/components/MusicToggle';

// True when a page is rendered as a section of the one-page home instead of its own route.
const SinglePageContext = createContext(false);
export const useIsSinglePage = () => useContext(SinglePageContext);

const REVEAL_ALL_EVENT = 'single-page-reveal-all';

// A page's outer wrapper: <main> on its own route, a plain block (no full-screen height) on the one-page home.
export function PageShell({ className = '', style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const embedded = useIsSinglePage();
  if (!embedded) return <main className={className} style={style}>{children}</main>;

  const embeddedStyle = { ...style };
  delete embeddedStyle.minHeight;
  // overflow-x-hidden would turn the wrapper into a scroll box and break sticky pinning; clip doesn't.
  return (
    <div
      className={className.replace(/\bmin-h-screen\b/g, '').replace(/\boverflow-x-hidden\b/g, 'overflow-x-clip').trim()}
      style={embeddedStyle}
    >
      {children}
    </div>
  );
}

// Renders its page only when the guest scrolls close to it, so the iPhone loads one section at a time.
export function LazySection({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const el = ref.current;
    if (!el) return;
    const reveal = () => setIsVisible(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) reveal();
      },
      { rootMargin: '700px 0px' }
    );
    observer.observe(el);
    document.addEventListener(REVEAL_ALL_EVENT, reveal);
    return () => {
      observer.disconnect();
      document.removeEventListener(REVEAL_ALL_EVENT, reveal);
    };
  }, [isVisible]);

  return (
    <section
      id={id}
      ref={ref}
      className="single-page-section scroll-mt-6"
      style={isVisible ? undefined : { minHeight: '100svh' }}
      data-testid={`single-page-section-${id}`}
    >
      <SinglePageContext.Provider value={true}>{isVisible && children}</SinglePageContext.Provider>
    </section>
  );
}

// Jump to a section: render every section first so nothing above it changes height mid-scroll.
export function scrollToSection(id: string) {
  return (e: MouseEvent) => {
    e.preventDefault();
    document.dispatchEvent(new Event(REVEAL_ALL_EVENT));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    );
  };
}

// The only fixed control left once the menu bar is gone.
export function FloatingMusicToggle() {
  const { isMuted, hasStarted, toggle, hydrate } = useAudioStore();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  if (!hasStarted) return null;
  return (
    <div
      className="fixed right-4 z-50"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
    >
      <MusicToggle isMuted={isMuted} onToggle={toggle} testId="music-toggle-floating" />
    </div>
  );
}
