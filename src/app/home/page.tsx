'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import DirectionsModal from '@/components/DirectionsModal';
import ScratchTheDate from '@/components/ScratchTheDate';
import { Phone, MapPin, CalendarPlus, Navigation as NavigationIcon } from 'lucide-react';

import { ceremonyEvent, receptionEvent } from '@/lib/events';
import { downloadICSFile } from '@/lib/calendar';
import { openMapInApp } from '@/lib/maps';

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // State for direction menus
  const [showDirectionsMenu, setShowDirectionsMenu] = useState(false);
  const [showReceptionDirectionsMenu, setShowReceptionDirectionsMenu] = useState(false);
  const [ceremonyCopied, setCeremonyCopied] = useState(false);
  const [receptionCopied, setReceptionCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => copyFallback(text));
    } else {
      copyFallback(text);
    }
  };

  const copyFallback = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999); // iOS requires this
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  // Scratch the date state
  // `scratchMounted` keeps the scratch section out of the pre-rendered HTML (no hydration mismatch).
  // We use useLayoutEffect (fires before paint) so there is zero visible delay — the scratch section
  // appears on the very first frame the browser draws, not a frame later like useEffect would.
  // The `typeof window` fallback to useEffect is only for `next build`'s server-side pass.
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  const [scratchMounted, setScratchMounted] = useState(false);
  const [alreadyScratched, setAlreadyScratched] = useState(false);
  const [scratchComplete, setScratchComplete] = useState(false);

  useIsomorphicLayoutEffect(() => {
    try {
      setAlreadyScratched(localStorage.getItem('weddingScratched') === 'true');
    } catch { /* Safari private browsing — treat as first visit */ }
    setScratchMounted(true);
  }, []);
  const scratchSectionRef = useRef<HTMLElement>(null);
  const scratchCardsRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);
  const lockFired = useRef(false);

  // Lock scroll (iOS-safe: body position:fixed trick keeps viewport exactly where it is)
  const lockScroll = useCallback(() => {
    if (lockFired.current) return;
    lockFired.current = true;
    savedScrollY.current = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${savedScrollY.current}px`;
  }, []);

  // Unlock scroll
  const unlockScroll = useCallback(() => {
    const y = savedScrollY.current;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    // Use 'instant' so there is zero animation — the restore is a single synchronous paint
    window.scrollTo({ top: y, behavior: 'instant' });
  }, []);

  // Lock when scratch cards are centered in the viewport
  // rootMargin '-20% 0px -60% 0px' = fires when the cards row is in the upper 20-40% band
  // (user scrolls 20% more than before, so more content below the cards is visible when locked)
  useEffect(() => {
    // Only lock for first-time visitors who haven't scratched yet
    if (!scratchMounted || alreadyScratched !== false || scratchComplete) return;
    const cards = scratchCardsRef.current;
    if (!cards) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lockScroll();
          observer.disconnect();
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    observer.observe(cards);
    return () => observer.disconnect();
  }, [scratchMounted, alreadyScratched, scratchComplete, lockScroll]);

  const handleScratchComplete = useCallback(() => {
    try { localStorage.setItem('weddingScratched', 'true'); } catch { /* ITP/private mode */ }
    setScratchComplete(true);
    // Unlock immediately — animations are already finished, the timeout caused a jarring flash
    unlockScroll();
  }, [unlockScroll]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F1ED]">
      <Navigation />

      {/* Spacer for fixed navbar */}
      <div className="h-24" />

      {/* Floating Image Marquee */}
      <section className="relative min-h-[60vh] flex flex-col justify-center py-12 bg-gradient-to-r from-[#F5F1ED] via-white/60 to-[#F5F1ED]" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10 pointer-events-none" />

        {/* Top row: right to left */}
        <div className="overflow-hidden w-full">
          <div style={{ display: 'flex', width: '7920px' }} className="marquee-rtl">
            {[...Array(2)].flatMap((_, setIndex) =>
              [
                '04446EEE-0136-418E-8902-62C240512589_1_105_c.jpeg',
                '2541030F-6D6B-4371-A4BA-3C32119F9069_1_105_c.jpeg',
                '2A9431D3-9F4F-437A-B5C6-E17595A55B57_1_105_c.jpeg',
                '38D3FC1B-AD16-4FDF-9F54-BB48A4A29A56_1_105_c.jpeg',
                '3BBD37D8-1EDA-4B45-A8DA-26F5C2B40DEA_1_105_c.jpeg',
                '41C52320-34D7-49B6-95B3-B4D49271D9B7_1_105_c.jpeg',
                '7CD00EBC-D6FC-44D1-B8CF-21BD319CEE49_1_105_c.jpeg',
                '8C1C35BA-2AAA-4A19-8D1F-272F7C119B69_1_105_c.jpeg',
                '95FA751A-7DC3-497B-9912-C832408865D8_1_105_c.jpeg',
                '9B540E62-DA4C-4F60-93CE-C4784369E726_1_105_c.jpeg',
                'AB20A646-3F68-4945-9E85-3BE4932307FC_1_105_c.jpeg',
                'B48CEB98-E69A-4C1E-9798-CFE315E7D9A5_1_105_c.jpeg',
                'B7CF0A72-82A0-49D4-B451-BA5BBAA4D442_1_105_c.jpeg',
                'DBDF2D51-A9DF-4BC1-87DC-58089D0AB3FD_1_105_c.jpeg',
                'EDEB0BCA-CAF3-4E72-B050-9233443B7C6A_1_105_c.jpeg',
                'EE4E2EFE-9BC4-4E66-A3E5-5D37E31898C5_1_105_c.jpeg',
                'EEC2C875-CEA2-47C8-940C-D56522D07FE8_1_105_c.jpeg',
                'F04BA61A-C8E5-4940-983E-FB4CFAAA77C7_1_105_c.jpeg',
              ].map((filename, i) => (
                <div key={`top-${setIndex}-${i}`} style={{ flexShrink: 0, width: '220px', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={`/images/${filename}`}
                    alt={`Wedding photo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle text */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem', position: 'relative', zIndex: 20, width: '100%', overflow: 'visible' }}>
          <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '7.552vw', lineHeight: 1.1, whiteSpace: 'nowrap', color: '#8B7355', display: 'block' }}>
            Bandana &amp; Tara
          </span>
        </div>

        {/* Bottom row: left to right */}
        <div className="overflow-hidden w-full">
          <div style={{ display: 'flex', width: '7920px' }} className="marquee-ltr">
            {[...Array(2)].flatMap((_, setIndex) =>
              [
                'F04BA61A-C8E5-4940-983E-FB4CFAAA77C7_1_105_c.jpeg',
                'EEC2C875-CEA2-47C8-940C-D56522D07FE8_1_105_c.jpeg',
                'EE4E2EFE-9BC4-4E66-A3E5-5D37E31898C5_1_105_c.jpeg',
                'EDEB0BCA-CAF3-4E72-B050-9233443B7C6A_1_105_c.jpeg',
                'DBDF2D51-A9DF-4BC1-87DC-58089D0AB3FD_1_105_c.jpeg',
                'B7CF0A72-82A0-49D4-B451-BA5BBAA4D442_1_105_c.jpeg',
                'B48CEB98-E69A-4C1E-9798-CFE315E7D9A5_1_105_c.jpeg',
                'AB20A646-3F68-4945-9E85-3BE4932307FC_1_105_c.jpeg',
                '9B540E62-DA4C-4F60-93CE-C4784369E726_1_105_c.jpeg',
                '95FA751A-7DC3-497B-9912-C832408865D8_1_105_c.jpeg',
                '8C1C35BA-2AAA-4A19-8D1F-272F7C119B69_1_105_c.jpeg',
                '7CD00EBC-D6FC-44D1-B8CF-21BD319CEE49_1_105_c.jpeg',
                '41C52320-34D7-49B6-95B3-B4D49271D9B7_1_105_c.jpeg',
                '3BBD37D8-1EDA-4B45-A8DA-26F5C2B40DEA_1_105_c.jpeg',
                '38D3FC1B-AD16-4FDF-9F54-BB48A4A29A56_1_105_c.jpeg',
                '2A9431D3-9F4F-437A-B5C6-E17595A55B57_1_105_c.jpeg',
                '2541030F-6D6B-4371-A4BA-3C32119F9069_1_105_c.jpeg',
                '04446EEE-0136-418E-8902-62C240512589_1_105_c.jpeg',
              ].map((filename, i) => (
                <div key={`bot-${setIndex}-${i}`} style={{ flexShrink: 0, width: '220px', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={`/images/${filename}`}
                    alt={`Wedding photo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Scratch the Date Section
          Not rendered during pre-build (scratchMounted=false) — eliminates Safari hydration mismatch.
          After first paint, useEffect sets scratchMounted=true and the correct alreadyScratched value.
          - alreadyScratched=true:  returning visitor → revealed state, no scroll lock
          - alreadyScratched=false: first visit → full scratch + scroll lock experience */}
      {scratchMounted && (alreadyScratched ? (
        /* Returning visitor: show revealed content */
        <section className="bg-transparent">
          <ScratchTheDate onComplete={handleScratchComplete} cardsRef={scratchCardsRef} revealed={true} />
        </section>
      ) : (
        <>
          {/* Spacer: gives breathing room so the scratch heading/cards peek in from the bottom */}
          <div style={{ height: '26vh' }} />
          <section ref={scratchSectionRef} className="bg-transparent">
            <ScratchTheDate onComplete={handleScratchComplete} cardsRef={scratchCardsRef} />
          </section>
        </>
      ))}

      {/* Main content */}
      <section style={{ width: '100%', boxSizing: 'border-box', padding: '0 1rem' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-6"
          />

          {/* Location */}
          <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4 flex items-center justify-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <MapPin className="w-6 h-6" />
              Wedding Ceremony Location
            </h3>
            <p className="text-base text-[#8B7355] mb-1">Home Economics Building</p>
            <p
              className="text-sm text-[#3D3D3D] mb-2 cursor-pointer hover:text-[#8B7355] transition-colors group inline-flex items-center gap-1"
              title="Click to copy address"
              onClick={() => {
                copyToClipboard('2050 Buffalo Dr, South Park Township, PA 15129');
                setCeremonyCopied(true);
                setTimeout(() => setCeremonyCopied(false), 2000);
              }}
            >
              {ceremonyCopied ? '✓ Copied!' : '2050 Buffalo Dr, South Park Township, PA 15129'}
            </p>
            <p className="text-lg text-[#3D3D3D] mb-2">
              <span className="font-semibold">9:30AM to 5PM</span>
            </p>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <div style={{ width: '100%', maxWidth: '600px', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                <iframe
                  title="Home Economics Building, South Park"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3044.5!2d-79.9987!3d40.2894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8834e1b0b0b0b0b1%3A0x0!2s2050+Buffalo+Dr%2C+South+Park+Township%2C+PA+15129!5e0!3m2!1sen!2sus!4v1713000000000"
                  width="100%"
                  height="350"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            {/* Buttons: Add to Calendar & Directions */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="relative">
                <button
                  onClick={() => downloadICSFile(ceremonyEvent)}
                  className="inline-flex items-center gap-2 border-2 border-[#8B7355] text-[#8B7355] rounded-full font-semibold bg-white hover:bg-[#f7f8f7] transition-shadow text-sm"
                  style={{ padding: '0.65rem 1.1rem' }}
                >
                  <CalendarPlus className="w-4 h-4 shrink-0" />
                  Add to Calendar
                </button>
              </div>

              <div className="relative">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => {
                      setShowDirectionsMenu(true);
                    }}
                    className="inline-flex items-center gap-2 border-2 border-[#8B7355] text-[#8B7355] rounded-full font-semibold bg-white hover:bg-[#f7f8f7] transition-shadow text-sm"
                    style={{ padding: '0.65rem 1.1rem' }}
                  >
                    <NavigationIcon className="w-4 h-4 shrink-0" />
                    Directions
                  </button>
                </div>
              </div>

              <DirectionsModal
                isOpen={showDirectionsMenu}
                onClose={() => setShowDirectionsMenu(false)}
                onSelectApp={(app) => openMapInApp(app, ceremonyEvent)}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4 flex items-center justify-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <MapPin className="w-6 h-6" />
              Wedding Reception Location
            </h3>
            {/* <p className="text-lg text-[#3D3D3D] mb-2">
              <span className="font-semibold">Wedding Ceremony</span>
            </p> */}
            <p className="text-base text-[#8B7355] mb-1">Star Venue LLC Party House</p>
            <p
              className="text-sm text-[#3D3D3D] mb-2 cursor-pointer hover:text-[#8B7355] transition-colors inline-flex items-center gap-1"
              title="Click to copy address"
              onClick={() => {
                copyToClipboard('4257 Eastland Square Dr Suite A, Columbus, OH 43232');
                setReceptionCopied(true);
                setTimeout(() => setReceptionCopied(false), 2000);
              }}
            >
              {receptionCopied ? '✓ Copied!' : '4257 Eastland Square Dr Suite A, Columbus, OH 43232'}
            </p>
            <p className="text-lg text-[#3D3D3D] mb-2">
              <span className="font-semibold">12PM to 11PM</span>
            </p>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <div style={{ width: '100%', maxWidth: '600px', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                <iframe
                  title="Star Venue LLC Party House, Columbus"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.0!2d-82.8314!3d39.9486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s4257+Eastland+Square+Dr+Suite+A%2C+Columbus%2C+OH+43232!5e0!3m2!1sen!2sus!4v1713000000001"
                  width="100%"
                  height="350"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            {/* Reception Buttons: Add to Calendar & Directions */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="relative">
                <button
                  onClick={() => downloadICSFile(receptionEvent)}
                  className="inline-flex items-center gap-2 border-2 border-[#8B7355] text-[#8B7355] rounded-full font-semibold bg-white hover:bg-[#f7f8f7] transition-shadow text-sm"
                  style={{ padding: '0.65rem 1.1rem' }}
                >
                  <CalendarPlus className="w-4 h-4 shrink-0" />
                  Add to Calendar
                </button>
              </div>

              <div className="relative">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setShowReceptionDirectionsMenu(true)}
                    className="inline-flex items-center gap-2 border-2 border-[#8B7355] text-[#8B7355] rounded-full font-semibold bg-white hover:bg-[#f7f8f7] transition-shadow text-sm"
                    style={{ padding: '0.65rem 1.1rem' }}
                  >
                    <NavigationIcon className="w-4 h-4 shrink-0" />
                    Directions
                  </button>
                </div>
              </div>

              <DirectionsModal
                isOpen={showReceptionDirectionsMenu}
                onClose={() => setShowReceptionDirectionsMenu(false)}
                onSelectApp={(app) => openMapInApp(app, receptionEvent)}
              />
            </div>
          </motion.div>

          <motion.div className='song-suggestion max-w-4xl mx-auto w-full text-center mt-8 py-12'>
            
            <p>Do you want to suggest songs for our reception?</p>
            <a
              href="/music"
              className="px-8 py-4 border-2 border-[#D4AF85] text-[#8B7355] rounded-full font-semibold uppercase tracking-wide text-sm transition-all inline-block hover:scale-105 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              Suggest Songs
            </a>
            </motion.div>

          {/* Registry */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ width: '100%', paddingTop: '4rem', paddingBottom: '4rem' }}
          >
            {/* Card */}
            <div style={{
              position: 'relative',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              background: '#FAF7F4',
              border: '1px solid #E8E0D5',
              boxShadow: '0 8px 40px rgba(139,115,85,0.13)',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0',
            }}>
              {/* Decorative top flourish */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '4px',
                background: 'linear-gradient(to right, #C9A96E, #8B7355, #C9A96E)',
              }} />

              {/* Icon */}
              <div style={{
                width: '64px', height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F5EFE6, #EDE0CF)',
                border: '1px solid #D4C4B0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 12px rgba(139,115,85,0.12)',
              }}>
                🎁
              </div>

              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
                fontWeight: 700,
                color: '#3D3229',
                marginBottom: '0.75rem',
                letterSpacing: '-0.01em',
              }}>
                Registry
              </h3>

              {/* Thin ornamental divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to right, transparent, #C9A96E)' }} />
                <span style={{ color: '#C9A96E', fontSize: '0.6rem', letterSpacing: '0.15em' }}>✦</span>
                <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to left, transparent, #C9A96E)' }} />
              </div>

              <p style={{
                fontFamily: "'Lora', serif",
                color: '#7A6652',
                fontSize: 'clamp(0.95rem, 3vw, 1.05rem)',
                lineHeight: 1.75,
                maxWidth: '420px',
                marginBottom: '2rem',
              }}>
                Your love and presence is the greatest gift of all. But if you'd like to celebrate us, we've curated a few things we'd cherish.
              </p>

              <a
                href="/registry"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 2.25rem',
                  background: 'linear-gradient(135deg, #8B7355, #A8896C)',
                  color: '#fff',
                  borderRadius: '3rem',
                  fontFamily: "'Lora', serif",
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 20px rgba(139,115,85,0.35)',
                  textDecoration: 'none',
                  touchAction: 'manipulation',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(139,115,85,0.4)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(139,115,85,0.35)'; }}
              >
                View Our Registry
              </a>
            </div>
          </motion.div>

        </motion.div>
      </section>
    </main>
  );
}
