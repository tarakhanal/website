'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image, { StaticImageData } from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import img1  from '@/app/images/04446EEE-0136-418E-8902-62C240512589_1_105_c.jpeg';
import img2  from '@/app/images/2541030F-6D6B-4371-A4BA-3C32119F9069_1_105_c.jpeg';
import img3  from '@/app/images/2A9431D3-9F4F-437A-B5C6-E17595A55B57_1_105_c.jpeg';
import img4  from '@/app/images/38D3FC1B-AD16-4FDF-9F54-BB48A4A29A56_1_105_c.jpeg';
import img5  from '@/app/images/3BBD37D8-1EDA-4B45-A8DA-26F5C2B40DEA_1_105_c.jpeg';
import img6  from '@/app/images/41C52320-34D7-49B6-95B3-B4D49271D9B7_1_105_c.jpeg';
import img7  from '@/app/images/7CD00EBC-D6FC-44D1-B8CF-21BD319CEE49_1_105_c.jpeg';
import img8  from '@/app/images/9B540E62-DA4C-4F60-93CE-C4784369E726_1_105_c.jpeg';
import img9  from '@/app/images/EEC2C875-CEA2-47C8-940C-D56522D07FE8_1_105_c.jpeg';
import img10 from '@/app/images/95FA751A-7DC3-497B-9912-C832408865D8_1_105_c.jpeg';
import img11 from '@/app/images/AB20A646-3F68-4945-9E85-3BE4932307FC_1_105_c.jpeg';
import img12 from '@/app/images/B48CEB98-E69A-4C1E-9798-CFE315E7D9A5_1_105_c.jpeg';

interface PhotoEntry {
  src: StaticImageData;
  caption: string;
  chapter: number;
}

const chapterLabels = [
  { label: 'year one',   subtitle: '2019' },
  { label: 'year two',   subtitle: '2020' },
  { label: 'year three', subtitle: '2021' },
  { label: 'year four', subtitle: '2022' },
  { label: 'year five', subtitle: '2023' },
  { label: 'year six', subtitle: '2024' },
  { label: 'year seven', subtitle: '2025' },
  { label: 'year eight', subtitle: '2026' },
];

const allPhotos: PhotoEntry[] = [
  { src: img1,  caption: 'The beginning',      chapter: 0 },
  { src: img2,  caption: 'Growing closer',      chapter: 0 },
  { src: img3,  caption: 'Side by side',        chapter: 0 },
  { src: img4,  caption: 'Finding each other',  chapter: 0 },
  { src: img5,  caption: 'Adventures together', chapter: 1 },
  { src: img6,  caption: 'Our favorite places', chapter: 1 },
  { src: img7,  caption: 'Always smiling',      chapter: 1 },
  { src: img8,  caption: 'Wherever we go',      chapter: 1 },
  { src: img9,  caption: 'A trip to remember',  chapter: 2 },
  { src: img10, caption: 'The question',        chapter: 2 },
  { src: img11, caption: 'She said yes',        chapter: 2 },
  { src: img12, caption: 'Forever starts now',  chapter: 2 },
];

const N = allPhotos.length;

const scatter = [
  { rot: -2,   x:  0  },
  { rot:  3.5, x:  14 },
  { rot: -4.5, x: -12 },
  { rot:  1.5, x:  8  },
  { rot: -3,   x: -6  },
  { rot:  2.5, x:  16 },
  { rot: -1.5, x: -10 },
  { rot:  4,   x:  6  },
  { rot: -2.5, x: -16 },
  { rot:  1,   x:  10 },
  { rot: -3.5, x: -4  },
  { rot:  2,   x:  12 },
];

// ─── Polaroid Stack ───────────────────────────────────────────────────────────
function PolaroidStack({ stackIndex, onOpen, sizes }: { stackIndex: number; onOpen: (i: number) => void; sizes: string }) {
  return (
    <div className="relative w-full" style={{ height: 'min(460px, 88vw)' }}>
      {allPhotos.map((photo, i) => {
        const { rot, x } = scatter[i];
        const stacked   = i <= stackIndex;
        const isPeek    = i === stackIndex + 1;
        const isHidden  = i > stackIndex + 1;
        // Keep peek card elevated so it animates OUT on top when scrolling back,
        // not from behind the pile. Hidden cards go to 0.
        const zIndex    = stacked ? i + 1 : isPeek ? stackIndex + 2 : 0;
        const yVal      = stacked ? '0%' : isPeek ? '110%' : '300%';
        const xVal      = stacked ? x : 0;
        const rotVal    = stacked ? rot : 0;
        const clickable = stacked || isPeek;

        return (
          <motion.div
            key={i}
            animate={{ y: yVal, x: xVal }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            style={{ zIndex, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: isHidden ? 'hidden' : 'visible' }}
          >
            <motion.div
              whileHover={clickable ? { scale: 1.04, rotate: 0, x: 0 } : {}}
              transition={{ duration: 0.2 }}
              onClick={() => clickable && onOpen(i)}
              className="bg-white shadow-2xl flex flex-col"
              style={{ padding: '12px 12px 52px 12px', width: 'min(400px, 88vw)', rotate: `${rotVal}deg`, cursor: clickable ? 'pointer' : 'default' }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <Image src={photo.src} alt={photo.caption} fill sizes={sizes} className="object-cover" />
              </div>
              <p className="text-center text-sm mt-3 text-[#6B5B4E]" style={{ fontFamily: "'Lora', serif" }}>
                {photo.caption}
              </p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ index, onClose, onPrev, onNext }: { index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const photo = allPhotos[index];
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-6"
      style={{ minHeight: '100dvh' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center w-full max-w-lg"
        style={{ maxHeight: 'calc(100dvh - 80px)' }}
      >
        <div className="bg-white shadow-2xl w-full flex flex-col" style={{ padding: '12px 12px 24px 12px', minHeight: 0 }}>
          {/* Close button */}
          <div className="flex justify-end mb-2 flex-shrink-0">
            <button onClick={onClose} className="text-[#8B7355]/60 hover:text-[#3D3229] transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center" style={{ minHeight: 0 }}>
            <Image
              src={photo.src}
              alt={photo.caption}
              style={{ maxWidth: '100%', maxHeight: '45vh', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
              sizes="(max-width: 768px) 92vw, 600px"
            />
          </div>
          <p className="text-center text-base mt-4 flex-shrink-0 text-[#6B5B4E]" style={{ fontFamily: "'Lora', serif" }}>{photo.caption}</p>
        </div>
        <div className="flex items-center justify-between w-full mt-4 px-1 flex-shrink-0">
          <button onClick={onPrev} className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-5 h-5" /> Prev
          </button>
          <span className="text-white/40 text-sm">{index + 1} / {N}</span>
          <button onClick={onNext} className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm">
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Chapter Label ────────────────────────────────────────────────────────────
function ChapterLabel({ stackIndex, mobile }: { stackIndex: number; mobile?: boolean }) {
  const activeChapter = allPhotos[stackIndex].chapter;
  return (
    <div className={`flex flex-col gap-3 ${mobile ? 'items-center text-center' : 'items-start text-left'}`}>
      <AnimatePresence mode="wait">
        <motion.div key={activeChapter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
          <p className="text-sm sm:text-base font-bold text-[#3D3229] leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
            {chapterLabels[activeChapter].label}:{' '}
            <span className="font-normal italic">{chapterLabels[activeChapter].subtitle}</span>
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1.5">
        {allPhotos.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{ width: i <= stackIndex ? 7 : 5, height: i <= stackIndex ? 7 : 5, backgroundColor: i <= stackIndex ? '#8B7355' : '#D4C4B0' }} />
        ))}
      </div>
      <p className="text-xs text-[#8B7355]/50">
        {stackIndex < N - 1
          ? (mobile ? 'swipe up to reveal more' : 'scroll to reveal more')
          : (mobile ? 'tap a photo to view' : 'click a photo to view')}
      </p>
    </div>
  );
}

// ─── Gallery Scroller ─────────────────────────────────────────────────────────
function GalleryScroller() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const [stackIndex, setStackIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const wheelBuffer = useRef(0);
  const touchStartY = useRef(0);
  const touchActive = useRef(false);
  const lastAdvance = useRef(0); // timestamp of last advance/retreat
  const WHEEL_THRESHOLD = 340;
  const TOUCH_THRESHOLD = 65;
  const COOLDOWN_MS = 800; // min ms between photo changes

  const advance = useCallback(() => setStackIndex((i) => Math.min(i + 1, N - 1)), []);
  const retreat = useCallback(() => setStackIndex((i) => Math.max(i - 1, 0)), []);

  // Lock body scroll for the entire gallery page — iOS Safari requires this at
  // the document level (not just the element) to reliably block native scroll.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevWidth = document.body.style.width;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.width = prevWidth;
    };
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0 && stackIndex < N - 1) {
        wheelBuffer.current += e.deltaY;
        if (wheelBuffer.current >= WHEEL_THRESHOLD && Date.now() - lastAdvance.current >= COOLDOWN_MS) {
          wheelBuffer.current = 0; lastAdvance.current = Date.now(); advance();
        }
      } else if (e.deltaY < 0 && stackIndex > 0) {
        wheelBuffer.current += e.deltaY;
        if (wheelBuffer.current <= -WHEEL_THRESHOLD && Date.now() - lastAdvance.current >= COOLDOWN_MS) {
          wheelBuffer.current = 0; lastAdvance.current = Date.now(); retreat();
        }
      } else {
        wheelBuffer.current = 0;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchActive.current = true;
      // Don't preventDefault here — it kills click events on the nav bar.
      // The body position:fixed lock already prevents iOS native scroll.
      // Only skip tracking if the touch is on the nav itself.
      const target = e.target as Element;
      if (target.closest('nav')) {
        touchActive.current = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive.current) return;
      e.preventDefault();
      const deltaY = touchStartY.current - e.touches[0].clientY;
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
      if (Date.now() - lastAdvance.current < COOLDOWN_MS) return;

      if (deltaY > 0 && stackIndex < N - 1) {
        // Swipe up → advance
        touchActive.current = false;
        lastAdvance.current = Date.now();
        touchStartY.current = e.touches[0].clientY;
        advance();
      } else if (deltaY < 0 && stackIndex > 0) {
        // Swipe down → retreat
        touchActive.current = false;
        lastAdvance.current = Date.now();
        touchStartY.current = e.touches[0].clientY;
        retreat();
      }
    };

    const onTouchEnd = () => { touchActive.current = false; };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [stackIndex, advance, retreat]);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);

  return (
    <>
      <div
        ref={sectionRef}
        className="flex flex-col items-center px-6 sm:px-12"
        style={{
          minHeight: '100svh',
          paddingTop: 'clamp(1.5rem, 6vw, 5rem)',
          touchAction: 'none',
        }}
      >
        {/* Mobile: chapter label above stack — sticky so it stays visible */}
        <div className="sm:hidden w-full max-w-lg mb-6 sticky top-20 z-20 bg-[#F7F3EE] py-2">
          <ChapterLabel stackIndex={stackIndex} mobile />
        </div>

        {/* Desktop: side-by-side */}
        <div className="hidden sm:flex w-full max-w-4xl flex-row gap-16 items-center justify-center">
          <div className="w-52 flex-shrink-0">
            <ChapterLabel stackIndex={stackIndex} />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <PolaroidStack stackIndex={stackIndex} onOpen={openLightbox} sizes="(max-width: 640px) 88vw, 400px" />
          </div>
        </div>

        {/* Mobile: stack centered */}
        <div className="sm:hidden w-full" style={{ marginTop: stackIndex === N - 1 ? 'min(100px, 18vw)' : 0, transition: 'margin-top 0.4s ease' }}>
          <PolaroidStack stackIndex={stackIndex} onOpen={openLightbox} sizes="88vw" />
        </div>

        {/* Spacer so peek card shows fully on mobile — hidden when all stacked */}
        {stackIndex < N - 1 && (
          <div className="sm:hidden" style={{ height: 'min(480px, 92vw)' }} />
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((p) => ((p ?? 0) - 1 + N) % N)}
            onNext={() => setLightboxIndex((p) => ((p ?? 0) + 1) % N)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  return (
    <main className="bg-[#F7F3EE] min-h-screen overflow-x-hidden">
      <Navigation />

      <section className="pt-40 pb-8 px-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#8B7355] mt-4 text-lg"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Moments from our journey together
        </motion.p>
      </section>

      <GalleryScroller />
    </main>
  );
}
