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
  { label: 'chapter one',   subtitle: 'how we met' },
  { label: 'chapter two',   subtitle: 'falling in love' },
  { label: 'chapter three', subtitle: 'the next step' },
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

// Predetermined scatter so the pile looks like real photos casually dropped
const scatter = [
  { rot: -2,   x:  0,  },
  { rot:  3.5, x:  14, },
  { rot: -4.5, x: -12, },
  { rot:  1.5, x:  8,  },
  { rot: -3,   x: -6,  },
  { rot:  2.5, x:  16, },
  { rot: -1.5, x: -10, },
  { rot:  4,   x:  6,  },
  { rot: -2.5, x: -16, },
  { rot:  1,   x:  10, },
  { rot: -3.5, x: -4,  },
  { rot:  2,   x:  12, },
];

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  index, onClose, onPrev, onNext,
}: { index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const photo = allPhotos[index];

  // keyboard navigation
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center w-full max-w-3xl"
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-7 h-7" />
        </button>

        <div className="bg-white shadow-2xl w-full" style={{ padding: '12px 12px 52px 12px' }}>
          <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
            <Image src={photo.src} alt={photo.caption} fill sizes="800px" className="object-cover" />
          </div>
          <p className="text-center text-base mt-4 text-[#6B5B4E]" style={{ fontFamily: "'Lora', serif" }}>
            {photo.caption}
          </p>
        </div>

        <div className="flex items-center justify-between w-full mt-5 px-1">
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

// ─── Gallery Scroller ─────────────────────────────────────────────────────────
function GalleryScroller() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // stackIndex: how many photos are currently visible (0 = only first, N-1 = all stacked)
  const [stackIndex, setStackIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isCapturing = useRef(false);
  const wheelBuffer = useRef(0);
  const WHEEL_THRESHOLD = 180; // px of wheel delta to advance one photo

  const activeChapter = allPhotos[stackIndex].chapter;

  const advance = useCallback(() => {
    setStackIndex((i) => Math.min(i + 1, N - 1));
  }, []);

  const retreat = useCallback(() => {
    setStackIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onWheel = (e: WheelEvent) => {
      const rect = section.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.7;

      if (!inView) return;

      // Scrolling down and not all stacked yet → capture
      if (e.deltaY > 0 && stackIndex < N - 1) {
        e.preventDefault();
        wheelBuffer.current += e.deltaY;
        if (wheelBuffer.current >= WHEEL_THRESHOLD) {
          wheelBuffer.current = 0;
          advance();
        }
        isCapturing.current = true;
        return;
      }

      // Scrolling up and not at base → capture
      if (e.deltaY < 0 && stackIndex > 0) {
        e.preventDefault();
        wheelBuffer.current += e.deltaY;
        if (wheelBuffer.current <= -WHEEL_THRESHOLD) {
          wheelBuffer.current = 0;
          retreat();
        }
        isCapturing.current = true;
        return;
      }

      isCapturing.current = false;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [stackIndex, advance, retreat]);

  return (
    <>
      <div
        ref={sectionRef}
        className="flex items-center justify-center py-8 sm:py-20 px-6 sm:px-12 pb-16 sm:pb-32"
        style={{ minHeight: 'min(85vh, 100%)' }}
      >
        <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-8 sm:gap-16 items-center">

          {/* Chapter label + dots — stacked vertically, centered on mobile */}
          <div className="w-full sm:w-52 flex-shrink-0 flex flex-col items-center sm:items-start gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChapter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-sm sm:text-base font-bold text-[#3D3229] leading-snug text-center sm:text-left" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {chapterLabels[activeChapter].label}:{' '}
                  <span className="font-normal italic">{chapterLabels[activeChapter].subtitle}</span>
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {allPhotos.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i <= stackIndex ? 7 : 5,
                    height: i <= stackIndex ? 7 : 5,
                    backgroundColor: i <= stackIndex ? '#8B7355' : '#D4C4B0',
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-[#8B7355]/50">
              {stackIndex < N - 1 ? 'scroll to reveal more' : 'click a photo to view'}
            </p>
          </div>

          {/* Stacking polaroids */}
          <div className="flex-1 relative w-full" style={{ height: 'min(460px, 88vw)' }}>
            {allPhotos.map((photo, i) => {
              const { rot, x } = scatter[i];
              const stacked = i <= stackIndex;
              // stacked: in pile; peek: full card visible just below the pile; hidden: off screen
              const yVal = stacked ? '0%' : i === stackIndex + 1 ? '102%' : '210%';
              const xVal = stacked ? x : 0;
              const rotVal = stacked ? rot : 0;
              return (
                <motion.div
                  key={i}
                  animate={{ y: yVal, x: xVal }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                  style={{ zIndex: i, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <motion.div
                    whileHover={stacked ? { scale: 1.04, rotate: 0, x: 0 } : {}}
                    transition={{ duration: 0.2 }}
                    onClick={() => stacked && setLightboxIndex(i)}
                    className="bg-white shadow-2xl flex flex-col"
                    style={{
                      padding: '12px 12px 52px 12px',
                      width: 'min(400px, 88vw)',
                      rotate: `${rotVal}deg`,
                      cursor: stacked ? 'pointer' : 'default',
                    }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <Image src={photo.src} alt={photo.caption} fill sizes="(max-width: 640px) 88vw, 400px" className="object-cover" />
                    </div>
                    <p className="text-center text-sm mt-3 text-[#6B5B4E]" style={{ fontFamily: "'Lora', serif" }}>
                      {photo.caption}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

        </div>
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
    <main className="bg-[#F7F3EE] min-h-screen">
      <Navigation />

      <section className="pt-40 pb-8 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[clamp(4rem,12vw,9rem)] leading-none text-[#3D3229] font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          gallery
        </motion.h1>
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
