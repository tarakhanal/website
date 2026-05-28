'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAudioStore } from '@/store/audioStore';

const PARTS = ['/audio/background_1.mp3', '/audio/background_2.mp3'];
const STORAGE_STARTED  = 'wedding_music_started';
const STORAGE_MUTED    = 'wedding_music_muted';
const STORAGE_POSITION = 'wedding_music_position';
const STORAGE_PART     = 'wedding_music_part';

export default function BackgroundMusic() {
  const pathname = usePathname();
  const { isMuted, hasStarted, setStarted, hydrate } = useAudioStore();

  // Hydrate store from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => { hydrate(); }, []);

  // Index of the currently active Audio object (0 or 1)
  const partRef      = useRef<number>(0);
  // The two Audio objects — current and next (pre-buffered)
  const audioRefs    = useRef<[HTMLAudioElement | null, HTMLAudioElement | null]>([null, null]);
  const interactionCleanupRef = useRef<(() => void) | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const current = () => audioRefs.current[partRef.current];

  const cancelInteraction = () => {
    interactionCleanupRef.current?.();
    interactionCleanupRef.current = null;
  };

  const savePosition = () => {
    const a = current();
    if (a && !a.paused) {
      localStorage.setItem(STORAGE_POSITION, String(a.currentTime));
      localStorage.setItem(STORAGE_PART, String(partRef.current));
    }
  };

  /** Try play(); if blocked, resume on the next user gesture. */
  const tryPlay = (audio: HTMLAudioElement) => {
    cancelInteraction();
    audio.play().catch(() => {
      const docEvents = ['click', 'keydown', 'touchstart', 'pointerdown'] as const;
      let cleaned = false;
      const handler = () => {
        if (cleaned) return;
        audioRefs.current[partRef.current]?.play().catch(() => {});
        cancelInteraction();
      };
      docEvents.forEach(e => document.addEventListener(e, handler, { once: true, passive: true }));
      window.addEventListener('scroll', handler, { once: true, passive: true });
      interactionCleanupRef.current = () => {
        cleaned = true;
        docEvents.forEach(e => document.removeEventListener(e, handler));
        window.removeEventListener('scroll', handler);
      };
    });
  };

  /** Advance to the next part when the current one ends, then loop. */
  const handlePartEnded = () => {
    const nextIdx = (partRef.current + 1) % PARTS.length;
    partRef.current = nextIdx;
    localStorage.setItem(STORAGE_PART, String(nextIdx));
    localStorage.setItem(STORAGE_POSITION, '0');

    const next = audioRefs.current[nextIdx];
    if (next) {
      next.currentTime = 0;
      const muted = localStorage.getItem(STORAGE_MUTED) === 'true';
      if (!muted) next.play().catch(() => {});
    }

    // Pre-buffer the part that will play after this one
    const afterIdx = (nextIdx + 1) % PARTS.length;
    if (audioRefs.current[afterIdx]) {
      audioRefs.current[afterIdx]!.load(); // reset so it's ready from the top
    }
  };

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const started  = localStorage.getItem(STORAGE_STARTED)  === 'true';
    const muted    = localStorage.getItem(STORAGE_MUTED)    === 'true';
    const savedPos = parseFloat(localStorage.getItem(STORAGE_POSITION) ?? '0');
    const savedPart = parseInt(localStorage.getItem(STORAGE_PART) ?? '0', 10);

    // Build both Audio objects
    PARTS.forEach((src, i) => {
      const a = new Audio(src);
      a.volume = 0.35;
      a.preload = i === 0 ? 'auto' : 'auto'; // both preload; browser prioritises part 1 via <link rel=preload>
      a.addEventListener('ended', handlePartEnded);
      audioRefs.current[i] = a;
    });

    // Restore saved part & position
    partRef.current = savedPart < PARTS.length ? savedPart : 0;
    const activeAudio = audioRefs.current[partRef.current]!;
    if (savedPos > 0) {
      activeAudio.addEventListener('canplay', () => {
        activeAudio.currentTime = savedPos;
      }, { once: true });
    }

    // Save position every 3 s
    saveIntervalRef.current = setInterval(savePosition, 3000);

    if (started && !muted && pathname !== '/') {
      tryPlay(activeAudio);
    }

    // ── First-play trigger from EnvelopeLanding's "View Details" tap ──────
    // The custom event is dispatched synchronously within the user gesture,
    // so audio.play() here IS within the trusted activation window on iOS Safari.
    const handleMusicStart = () => {
      const a = audioRefs.current[partRef.current];
      if (!a) return;
      const nowMuted = localStorage.getItem(STORAGE_MUTED) === 'true';
      if (!nowMuted) {
        a.play().catch(() => {});
      }
      setStarted(true);
    };
    document.addEventListener('wedding-music-start', handleMusicStart, { once: true });

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      savePosition();
      cancelInteraction();
      document.removeEventListener('wedding-music-start', handleMusicStart);
      audioRefs.current.forEach(a => { a?.removeEventListener('ended', handlePartEnded); a?.pause(); });
      audioRefs.current = [null, null];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pause when on envelope page ───────────────────────────────────────────
  useEffect(() => {
    if (pathname !== '/') return;
    cancelInteraction();
    current()?.pause();
  }, [pathname]);

  // ── First-ever play (from "View Details" click) ──────────────────────────
  useEffect(() => {
    if (pathname === '/' || hasStarted) return;
    if (localStorage.getItem(STORAGE_STARTED) === 'true' && !isMuted) {
      const a = current();
      if (a) { a.play().catch(() => {}); setStarted(true); }
    }
  }, [pathname, hasStarted, isMuted, setStarted]);

  // ── Mute → pause | Unmute → resume ───────────────────────────────────────
  useEffect(() => {
    if (pathname === '/') return;
    const a = current();
    if (!a) return;
    if (isMuted) {
      cancelInteraction();
      a.pause();
    } else if (hasStarted) {
      tryPlay(a);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted]);

  return null;
}
