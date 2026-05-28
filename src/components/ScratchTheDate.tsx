'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ScratchCard from './ScratchCard';
import { useCountdown } from '@/hooks/useCountdown';

const DATE_PARTS = [
  { label: 'Month', value: 'April' },
  { label: 'Day',   value: '24' },
  { label: 'Year',  value: '2027' },
];

const CELEBRATE_WORDS = ["We", "can't", "wait", "to", "celebrate", "with", "you!"];

// VIDEO: drop your save-the-date video at /public/videos/save-the-date.mp4
// const VIDEO_SRC = '/videos/save-the-date.mp4';

interface ScratchTheDateProps {
  onComplete: () => void;
  cardsRef?: React.RefObject<HTMLDivElement | null>;
  /** true for returning visitors — skip straight to the final revealed state */
  revealed?: boolean;
}

export default function ScratchTheDate({ onComplete, cardsRef, revealed = false }: ScratchTheDateProps) {
  const [scratchedCount, setScratchedCount] = useState(revealed ? 3 : 0);
  const [allScratched, setAllScratched] = useState(revealed);
  const [showCountdown, setShowCountdown] = useState(revealed);
  // wordIndex: -1 = not started, 0..N = animating, N = done (all words shown forever)
  const [wordIndex, setWordIndex] = useState(revealed ? CELEBRATE_WORDS.length - 1 : -1);
  const [doneAnimating, setDoneAnimating] = useState(revealed);
  const scratchedSet = useRef(new Set<number>());
  const { days, hours, minutes, seconds } = useCountdown();

  const fireConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#c8a96e', '#d4b483', '#b89060', '#f5ede0', '#ffffff', '#e8d5b0'];
    const frame = () => {
      confetti({ particleCount: 6, angle: 60,  spread: 55, origin: { x: 0 }, colors, shapes: ['circle', 'square'], scalar: 1.1 });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors, shapes: ['circle', 'square'], scalar: 1.1 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  const handleScratched = useCallback((index: number) => {
    if (scratchedSet.current.has(index)) return;
    scratchedSet.current.add(index);
    const newCount = scratchedSet.current.size;
    setScratchedCount(newCount);
    if (newCount === 3) setAllScratched(true);
  }, []);

  // When all scratched (first-time experience only — skip if revealed mode):
  //   500ms  → fire confetti (2s duration)
  //   2100ms → show countdown (80% through confetti = 500 + 2000×0.8)
  //   2500ms → start word-by-word (confetti done = 500 + 2000)
  useEffect(() => {
    if (!allScratched || revealed) return;
    const t1 = setTimeout(() => fireConfetti(), 500);
    const t2 = setTimeout(() => setShowCountdown(true), 2100);
    const t3 = setTimeout(() => setWordIndex(0), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [allScratched, fireConfetti, revealed]);

  // Advance word-by-word; once all words shown, signal done (skip if revealed mode)
  useEffect(() => {
    if (revealed) return;
    if (wordIndex < 0 || wordIndex >= CELEBRATE_WORDS.length) return;
    if (wordIndex === CELEBRATE_WORDS.length - 1) {
      const t = setTimeout(() => { setDoneAnimating(true); onComplete(); }, 1800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setWordIndex(w => w + 1), 420);
    return () => clearTimeout(t);
  }, [wordIndex, onComplete, revealed]);

  return (
    // bg-transparent so the page gradient shows through behind the scratch section
    <div
      className="flex flex-col items-center justify-start min-h-screen px-4 pb-16 text-center gap-8 bg-transparent"
      style={{ paddingTop: revealed ? '7rem' : '2rem' }}
    >

      {/* Heading — changes based on mode */}
      <motion.div
        initial={revealed ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-2"
      >
        {revealed ? (
          <p
            className="text-[#8B7355]"
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(2rem, 7vw, 3.5rem)', lineHeight: 1.2 }}
          >
            Save the Date
          </p>
        ) : (
          <>
            <p
              className="text-[#8B7355]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(2rem, 7vw, 3.5rem)', lineHeight: 1.2 }}
            >
              Scratch to Reveal Our Date
            </p>
            <AnimatePresence>
              {scratchedCount < 3 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-[#8B7355] tracking-wider uppercase"
                  style={{ fontFamily: 'serif' }}
                >
                  {3 - scratchedCount} remaining
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>

      {/* Scratch cards — shown only during the scratch experience */}
      {!revealed && (
        <motion.div
          ref={cardsRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-row items-end justify-center gap-4 sm:gap-8"
        >
          {DATE_PARTS.map((part, i) => (
            <ScratchCard
              key={part.label}
              label={part.label}
              revealText={part.value}
              onScratched={() => handleScratched(i)}
            />
          ))}
        </motion.div>
      )}

      {/* Revealed date — shown for returning visitors, styled to match the post-scratch reveal layer */}
      {revealed && (
        <div className="flex flex-row items-end justify-center gap-4 sm:gap-8">
          {DATE_PARTS.map((part) => (
            <div key={part.label} className="flex flex-col items-center gap-3">
              <p
                className="text-sm uppercase tracking-widest text-[#8B7355] font-semibold"
                style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.2em' }}
              >
                {part.label}
              </p>
              <div
                className="relative rounded-2xl overflow-hidden shadow-xl flex items-center justify-center"
                style={{
                  width: 'clamp(90px, 26vw, 160px)',
                  height: 'clamp(90px, 26vw, 160px)',
                  background: 'linear-gradient(135deg, #fdf6ee 0%, #f5ede0 100%)',
                  border: '2px solid #d4b483',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontSize: 'clamp(1.4rem, 5vw, 2.1rem)',
                    color: '#8B7355',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    padding: '0 8px',
                  }}
                >
                  {part.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIDEO placeholder — uncomment and add /public/videos/save-the-date.mp4 when ready */}
      {/*
      {showVideo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full flex justify-center px-4"
          style={{ maxWidth: '520px', margin: '0 auto' }}
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl w-full" style={{ border: '2px solid #d4b483' }}>
            <video ref={videoRef} src={VIDEO_SRC} muted playsInline loop controls
              className="w-full" style={{ display: 'block', maxHeight: '320px', objectFit: 'cover' }} />
          </div>
        </motion.div>
      )}
      */}

      {/* Hint — only shown during scratch experience, exits once all scratched */}
      <AnimatePresence>
        {!revealed && !allScratched && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[#8B7355] tracking-widest uppercase"
            style={{ fontFamily: 'serif' }}
          >
            use your finger or mouse to scratch
          </motion.p>
        )}
      </AnimatePresence>

      {/* Countdown — fades in once all scratched and STAYS (instant in revealed mode) */}
      {showCountdown && (
        <motion.div
          initial={revealed ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.8rem, 6vw, 3rem)', color: '#b39979' }}>
            Our Forever Starts In
          </p>
          <div className="flex justify-center items-center gap-6 sm:gap-12">
            {[{ val: days, unit: 'Days' }, { val: hours, unit: 'Hours' }, { val: minutes, unit: 'Minutes' }, { val: seconds, unit: 'Seconds' }].map(({ val, unit }) => (
              <div key={unit} className="text-center">
                <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="font-bold text-[#8B7355]">{val}</div>
                <div className="text-xs text-[#8B7355] uppercase tracking-wider mt-1">{unit}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* "We can't wait to celebrate with you!" — instant in revealed mode, animated on first scratch */}
      {wordIndex >= 0 && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-4" style={{ maxWidth: '480px' }}>
          {CELEBRATE_WORDS.map((word, i) => (
            i <= wordIndex ? (
              <motion.span
                key={i}
                initial={revealed ? false : { opacity: 0, y: 18, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', color: '#8B7355', display: 'inline-block' }}
              >
                {word}
              </motion.span>
            ) : null
          ))}
        </div>
      )}

      {/* Scroll to continue nudge — instant in revealed mode, animated after first scratch */}
      {doneAnimating && (
        <motion.div
          initial={revealed ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: revealed ? 0 : 0.4, duration: 0.6 }}
          className="flex flex-col items-center gap-1 text-[#8B7355]/50"
        >
          <p className="text-xs uppercase tracking-widest" style={{ fontFamily: 'serif' }}>scroll to continue</p>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
