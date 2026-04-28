'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCountdown } from '@/hooks/useCountdown';

const GUEST_NAME_KEY = 'wedding_guest_name';

export default function EnvelopeLanding() {
  const [stage, setStage] = useState<'envelope' | 'animating' | 'opened'>('envelope');
  const [guestName, setGuestName] = useState<string | null>(null);
  const { days, hours, minutes, seconds } = useCountdown();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlName = searchParams.get('name');
    if (urlName) {
      localStorage.setItem(GUEST_NAME_KEY, urlName);
      setGuestName(urlName);
    } else {
      setGuestName(localStorage.getItem(GUEST_NAME_KEY));
    }
  }, [searchParams]);

  const handleCardClick = () => {
    if (stage === 'envelope') {
      setStage('animating');
      setTimeout(() => setStage('opened'), 2400);
    }
  };

  // Stage 3: Fully opened - show the invitation content
  if (stage === 'opened') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-[#F5E6E0] to-[#E8D5CC] flex flex-col items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-[#3D3D3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Together with
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-[#C41E3A] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Tara & Bandana
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-lg text-[#3D3D3D] mb-8 font-light"
          >
            May 8, 2027
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex justify-center gap-8 md:gap-12 mb-12"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#C41E3A]">{days}</div>
              <div className="text-sm text-[#8B7355] uppercase tracking-wider">Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#C41E3A]">{hours}</div>
              <div className="text-sm text-[#8B7355] uppercase tracking-wider">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#C41E3A]">{minutes}</div>
              <div className="text-sm text-[#8B7355] uppercase tracking-wider">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#C41E3A]">{seconds}</div>
              <div className="text-sm text-[#8B7355] uppercase tracking-wider">Seconds</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(196, 30, 58, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-3 bg-[#C41E3A] text-white rounded-full font-semibold uppercase tracking-wide text-sm transition-all"
              >
                View Details
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Stage 2: Card flying out animation
  // We render the FULL envelope (same as stage 1) sliding down,
  // with a cream card sliding up from behind it.
  if (stage === 'animating') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5E6E0] to-[#E8D5CC] flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-sm flex flex-col items-center">

          {/* Letter card – starts behind envelope, slides UP */}
          <motion.div
            className="absolute w-[88%] left-[6%]"
            style={{ aspectRatio: '9/14', zIndex: 1 }}
            initial={{ y: 0 }}
            animate={{
              y: [0, -300, -300],
              scale: [1, 1, 3.5],
              borderRadius: ['8px', '8px', '0px'],
            }}
            transition={{
              duration: 2.4,
              times: [0, 0.5, 1],
              ease: 'easeInOut',
            }}
          >
            <div className="w-full h-full bg-gradient-to-b from-[#FFF8F0] to-[#F5E6E0] rounded-lg shadow-xl flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <p className="text-[#8B7355] text-sm uppercase tracking-widest mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Together with</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#C41E3A] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Tara & Bandana
                </h2>
                <p className="text-[#8B7355] text-xs tracking-wide">May 8, 2027</p>
              </div>
            </div>
          </motion.div>

          {/* Full envelope – slides DOWN while staying on top */}
          <motion.div
            className="w-full relative"
            style={{ zIndex: 2 }}
            initial={{ y: 0 }}
            animate={{ y: 600 }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              className="relative w-full bg-[#B81A2D] rounded-lg shadow-2xl overflow-hidden"
              style={{ aspectRatio: '9/14' }}
            >
              {/* Textured paper background */}
              <div className="absolute inset-0 opacity-15">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                  <filter id="paperNoise2">
                    <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="5" />
                    <feColorMatrix type="saturate" values="0" />
                  </filter>
                  <rect width="100" height="100" fill="#fff" filter="url(#paperNoise2)" />
                </svg>
              </div>

              {/* Gold double border */}
              <div className="absolute inset-[10px] border-[2px] border-[#D4AF85] opacity-70 rounded-sm z-[1]"></div>
              <div className="absolute inset-[16px] border-[1px] border-[#D4AF85] opacity-50 rounded-sm z-[1]"></div>

              {/* Full SVG decorations */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <g id="lotusUpLg2">
                    <path d="M 0,0 C -4,-2 -14,-12 -10,-18 C -7,-22 -2,-18 0,-10 C 2,-18 7,-22 10,-18 C 14,-12 4,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(-14, 2) rotate(-35, 0, 0)"/>
                    <path d="M 0,0 C -4,-2 -14,-12 -10,-18 C -7,-22 -2,-18 0,-10 C 2,-18 7,-22 10,-18 C 14,-12 4,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(14, 2) rotate(35, 0, 0)"/>
                    <path d="M 0,0 C -4,-2 -14,-14 -9,-20 C -6,-24 -2,-19 0,-12 C 2,-19 6,-24 9,-20 C 14,-14 4,-2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(-8, -1) rotate(-18, 0, 0)"/>
                    <path d="M 0,0 C -4,-2 -14,-14 -9,-20 C -6,-24 -2,-19 0,-12 C 2,-19 6,-24 9,-20 C 14,-14 4,-2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(8, -1) rotate(18, 0, 0)"/>
                    <path d="M 0,0 C -3,-3 -10,-16 -6,-22 C -3,-26 -1,-20 0,-14 C 1,-20 3,-26 6,-22 C 10,-16 3,-3 0,0 Z" fill="#E8C896" opacity="0.85" transform="translate(-3, -2)"/>
                    <path d="M 0,0 C -3,-3 -10,-16 -6,-22 C -3,-26 -1,-20 0,-14 C 1,-20 3,-26 6,-22 C 10,-16 3,-3 0,0 Z" fill="#E8C896" opacity="0.85" transform="translate(3, -2)"/>
                    <path d="M 0,0 C -2,-4 -7,-18 -4,-24 C -2,-27 -0.5,-22 0,-16 C 0.5,-22 2,-27 4,-24 C 7,-18 2,-4 0,0 Z" fill="#F0D8A8" opacity="0.95"/>
                    <circle cx="0" cy="-3" r="2" fill="#D4A050" opacity="0.5"/>
                  </g>
                  <g id="lotusUpMd2">
                    <path d="M 0,0 C -3,-2 -10,-10 -7,-14 C -5,-17 -1.5,-13 0,-8 C 1.5,-13 5,-17 7,-14 C 10,-10 3,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(-10, 1.5) rotate(-32, 0, 0)"/>
                    <path d="M 0,0 C -3,-2 -10,-10 -7,-14 C -5,-17 -1.5,-13 0,-8 C 1.5,-13 5,-17 7,-14 C 10,-10 3,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(10, 1.5) rotate(32, 0, 0)"/>
                    <path d="M 0,0 C -3,-2 -10,-11 -7,-16 C -4.5,-19 -1.5,-15 0,-9 C 1.5,-15 4.5,-19 7,-16 C 10,-11 3,-2 0,0 Z" fill="#E8C896" opacity="0.78" transform="translate(-5.5, -0.5) rotate(-15, 0, 0)"/>
                    <path d="M 0,0 C -3,-2 -10,-11 -7,-16 C -4.5,-19 -1.5,-15 0,-9 C 1.5,-15 4.5,-19 7,-16 C 10,-11 3,-2 0,0 Z" fill="#E8C896" opacity="0.78" transform="translate(5.5, -0.5) rotate(15, 0, 0)"/>
                    <path d="M 0,0 C -2,-3 -7,-14 -4,-18 C -2,-21 -0.5,-16 0,-11 C 0.5,-16 2,-21 4,-18 C 7,-14 2,-3 0,0 Z" fill="#F0D8A8" opacity="0.92"/>
                    <circle cx="0" cy="-2.5" r="1.5" fill="#D4A050" opacity="0.5"/>
                  </g>
                  <g id="lotusUpSm2">
                    <path d="M 0,0 C -2,-1.5 -7,-8 -5,-11 C -3.5,-13 -1,-10 0,-6 C 1,-10 3.5,-13 5,-11 C 7,-8 2,-1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(-6, 1) rotate(-28, 0, 0)"/>
                    <path d="M 0,0 C -2,-1.5 -7,-8 -5,-11 C -3.5,-13 -1,-10 0,-6 C 1,-10 3.5,-13 5,-11 C 7,-8 2,-1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(6, 1) rotate(28, 0, 0)"/>
                    <path d="M 0,0 C -2,-2 -6,-10 -4,-13 C -2,-15.5 -0.5,-12 0,-8 C 0.5,-12 2,-15.5 4,-13 C 6,-10 2,-2 0,0 Z" fill="#F0D8A8" opacity="0.9"/>
                    <circle cx="0" cy="-2" r="1.2" fill="#D4A050" opacity="0.5"/>
                  </g>
                  <g id="lotusBud2">
                    <path d="M 0,0 C -1.5,-1.5 -5,-7 -3,-10 C -1.5,-12 -0.5,-9 0,-5.5 C 0.5,-9 1.5,-12 3,-10 C 5,-7 1.5,-1.5 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(-3, 0.5) rotate(-18, 0, 0)"/>
                    <path d="M 0,0 C -1.5,-1.5 -5,-7 -3,-10 C -1.5,-12 -0.5,-9 0,-5.5 C 0.5,-9 1.5,-12 3,-10 C 5,-7 1.5,-1.5 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(3, 0.5) rotate(18, 0, 0)"/>
                    <path d="M 0,0 C -1,-2 -4,-8 -2.5,-10.5 C -1,-12.5 -0.3,-9 0,-6 C 0.3,-9 1,-12.5 2.5,-10.5 C 4,-8 1,-2 0,0 Z" fill="#F0D8A8" opacity="0.9"/>
                    <circle cx="0" cy="-1.5" r="0.9" fill="#D4A050" opacity="0.5"/>
                  </g>
                  <g id="lotusHangLg2">
                    <path d="M 0,0 C -4,2 -14,12 -10,18 C -7,22 -2,18 0,10 C 2,18 7,22 10,18 C 14,12 4,2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(-14, -2) rotate(35, 0, 0)"/>
                    <path d="M 0,0 C -4,2 -14,12 -10,18 C -7,22 -2,18 0,10 C 2,18 7,22 10,18 C 14,12 4,2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(14, -2) rotate(-35, 0, 0)"/>
                    <path d="M 0,0 C -4,2 -14,14 -9,20 C -6,24 -2,19 0,12 C 2,19 6,24 9,20 C 14,14 4,2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(-8, 1) rotate(18, 0, 0)"/>
                    <path d="M 0,0 C -4,2 -14,14 -9,20 C -6,24 -2,19 0,12 C 2,19 6,24 9,20 C 14,14 4,2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(8, 1) rotate(-18, 0, 0)"/>
                    <path d="M 0,0 C -2,4 -7,18 -4,24 C -2,27 -0.5,22 0,16 C 0.5,22 2,27 4,24 C 7,18 2,4 0,0 Z" fill="#F0D8A8" opacity="0.95"/>
                    <circle cx="0" cy="3" r="2" fill="#D4A050" opacity="0.5"/>
                  </g>
                  <g id="lotusHangSm2">
                    <path d="M 0,0 C -2,1.5 -7,8 -5,11 C -3.5,13 -1,10 0,6 C 1,10 3.5,13 5,11 C 7,8 2,1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(-6, -1) rotate(28, 0, 0)"/>
                    <path d="M 0,0 C -2,1.5 -7,8 -5,11 C -3.5,13 -1,10 0,6 C 1,10 3.5,13 5,11 C 7,8 2,1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(6, -1) rotate(-28, 0, 0)"/>
                    <path d="M 0,0 C -2,2 -6,10 -4,13 C -2,15.5 -0.5,12 0,8 C 0.5,12 2,15.5 4,13 C 6,10 2,2 0,0 Z" fill="#F0D8A8" opacity="0.9"/>
                    <circle cx="0" cy="2" r="1.2" fill="#D4A050" opacity="0.5"/>
                  </g>
                  <g id="leafNode2">
                    <path d="M -3,0.5 C -5,-2 -7,-6 -5,-8 C -3,-10 -1,-5 0,-2 C 1,-5 3,-10 5,-8 C 7,-6 5,-2 3,0.5" fill="#E8C896" opacity="0.8"/>
                  </g>
                  <g id="leafNodeHang2">
                    <path d="M -3,-0.5 C -5,2 -7,6 -5,8 C -3,10 -1,5 0,2 C 1,5 3,10 5,8 C 7,6 5,2 3,-0.5" fill="#E8C896" opacity="0.8"/>
                  </g>
                </defs>

                {/* TOP hanging flowers */}
                <g>
                  <line x1="40" y1="0" x2="40" y2="95" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                  <use href="#lotusHangSm2" x="40" y="91"/>
                  <use href="#leafNodeHang2" x="40" y="50"/>
                </g>
                <g>
                  <line x1="65" y1="0" x2="65" y2="140" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                  <use href="#lotusHangLg2" x="65" y="135"/>
                  <use href="#leafNodeHang2" x="65" y="40"/>
                  <use href="#leafNodeHang2" x="65" y="72"/>
                  <use href="#leafNodeHang2" x="65" y="104"/>
                </g>
                <g>
                  <line x1="90" y1="0" x2="90" y2="88" stroke="#D4AF85" strokeWidth="0.65" opacity="0.75"/>
                  <use href="#lotusHangSm2" x="90" y="84"/>
                  <use href="#leafNodeHang2" x="90" y="45"/>
                </g>
                <g>
                  <line x1="270" y1="0" x2="270" y2="88" stroke="#D4AF85" strokeWidth="0.65" opacity="0.75"/>
                  <use href="#lotusHangSm2" x="270" y="84"/>
                  <use href="#leafNodeHang2" x="270" y="45"/>
                </g>
                <g>
                  <line x1="295" y1="0" x2="295" y2="140" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                  <use href="#lotusHangLg2" x="295" y="135"/>
                  <use href="#leafNodeHang2" x="295" y="40"/>
                  <use href="#leafNodeHang2" x="295" y="72"/>
                  <use href="#leafNodeHang2" x="295" y="104"/>
                </g>
                <g>
                  <line x1="320" y1="0" x2="320" y2="95" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                  <use href="#lotusHangSm2" x="320" y="91"/>
                  <use href="#leafNodeHang2" x="320" y="50"/>
                </g>

                {/* Flourish */}
                <g transform="translate(180, 265)" opacity="0.8">
                  <path d="M -75 -18 C -82 -24, -88 -18, -85 -12 C -82 -6, -74 -10, -75 -18" stroke="#D4AF85" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                  <path d="M -75 -14 C -65 -8, -55 15, -30 22 C -5 29, 20 28, 40 22 C 60 16, 70 5, 55 -2 C 40 -9, 15 -5, -5 5 C -25 15, -45 22, -55 15 C -65 8, -55 -2, -40 2 C -25 6, -5 15, 20 18 C 45 21, 65 15, 75 5" stroke="#D4AF85" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                  <path d="M 75 5 C 80 -2, 85 2, 82 8 C 79 14, 73 10, 75 5" stroke="#D4AF85" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                </g>

                {/* BOTTOM LEFT flowers */}
                <g>
                  <line x1="120" y1="555" x2="120" y2="385" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                  <use href="#lotusUpLg2" x="120" y="387"/>
                  <use href="#leafNode2" x="120" y="520"/><use href="#leafNode2" x="120" y="480"/><use href="#leafNode2" x="120" y="440"/>
                </g>
                <g>
                  <line x1="100" y1="555" x2="100" y2="385" stroke="#D4AF85" strokeWidth="0.9" opacity="0.88"/>
                  <use href="#lotusUpMd2" x="100" y="387"/>
                  <use href="#leafNode2" x="100" y="510"/><use href="#leafNode2" x="100" y="460"/>
                </g>
                <g>
                  <line x1="78" y1="555" x2="78" y2="410" stroke="#D4AF85" strokeWidth="0.9" opacity="0.85"/>
                  <use href="#lotusUpMd2" x="78" y="412"/>
                  <use href="#leafNode2" x="78" y="515"/><use href="#leafNode2" x="78" y="470"/>
                </g>
                <g>
                  <line x1="55" y1="555" x2="55" y2="435" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                  <use href="#lotusUpLg2" x="55" y="437"/>
                  <use href="#leafNode2" x="55" y="510"/>
                </g>
                <g>
                  <line x1="38" y1="555" x2="38" y2="470" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                  <use href="#lotusUpSm2" x="38" y="472"/>
                  <use href="#leafNode2" x="38" y="520"/>
                </g>
                <g>
                  <line x1="68" y1="555" x2="68" y2="485" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                  <use href="#lotusBud2" x="68" y="487"/>
                </g>
                <g>
                  <line x1="28" y1="555" x2="28" y2="500" stroke="#D4AF85" strokeWidth="0.6" opacity="0.7"/>
                  <use href="#lotusBud2" x="28" y="502"/>
                </g>

                {/* BOTTOM RIGHT flowers */}
                <g>
                  <line x1="240" y1="555" x2="240" y2="385" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                  <use href="#lotusUpLg2" x="240" y="387"/>
                  <use href="#leafNode2" x="240" y="520"/><use href="#leafNode2" x="240" y="480"/><use href="#leafNode2" x="240" y="440"/>
                </g>
                <g>
                  <line x1="260" y1="555" x2="260" y2="385" stroke="#D4AF85" strokeWidth="0.9" opacity="0.88"/>
                  <use href="#lotusUpMd2" x="260" y="387"/>
                  <use href="#leafNode2" x="260" y="510"/><use href="#leafNode2" x="260" y="460"/>
                </g>
                <g>
                  <line x1="282" y1="555" x2="282" y2="410" stroke="#D4AF85" strokeWidth="0.9" opacity="0.85"/>
                  <use href="#lotusUpMd2" x="282" y="412"/>
                  <use href="#leafNode2" x="282" y="515"/><use href="#leafNode2" x="282" y="470"/>
                </g>
                <g>
                  <line x1="305" y1="555" x2="305" y2="435" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                  <use href="#lotusUpLg2" x="305" y="437"/>
                  <use href="#leafNode2" x="305" y="510"/>
                </g>
                <g>
                  <line x1="322" y1="555" x2="322" y2="470" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                  <use href="#lotusUpSm2" x="322" y="472"/>
                  <use href="#leafNode2" x="322" y="520"/>
                </g>
                <g>
                  <line x1="292" y1="555" x2="292" y2="485" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                  <use href="#lotusBud2" x="292" y="487"/>
                </g>
                <g>
                  <line x1="335" y1="555" x2="335" y2="500" stroke="#D4AF85" strokeWidth="0.6" opacity="0.7"/>
                  <use href="#lotusBud2" x="335" y="502"/>
                </g>

                {/* BOTTOM CENTER fill flowers */}
                <g>
                  <line x1="155" y1="555" x2="155" y2="460" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                  <use href="#lotusBud2" x="155" y="462"/>
                </g>
                <g>
                  <line x1="180" y1="555" x2="180" y2="430" stroke="#D4AF85" strokeWidth="0.8" opacity="0.85"/>
                  <use href="#lotusUpMd2" x="180" y="432"/>
                  <use href="#leafNode2" x="180" y="510"/>
                </g>
                <g>
                  <line x1="205" y1="555" x2="205" y2="460" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                  <use href="#lotusBud2" x="205" y="462"/>
                </g>
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center z-10" style={{ justifyContent: 'center', paddingBottom: '18%' }}>
                <div className="text-center">
                  <div className="text-[#E8C896] text-5xl md:text-6xl font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 0 15px rgba(232,200,150,0.4), 0 2px 4px rgba(0,0,0,0.2)' }}>
                    निमन्त्रणा
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Stage 1: Envelope
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5E6E0] to-[#E8D5CC] flex items-center justify-center p-4">
      <div className="w-full flex flex-col items-center justify-center gap-8">
        {/* Wedding Card Container */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Card Front */}
          <motion.button
            onClick={handleCardClick}
            className="relative w-full bg-[#B81A2D] rounded-lg shadow-2xl overflow-hidden focus:outline-none"
            style={{ aspectRatio: '9/14' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Textured paper background */}
            <div className="absolute inset-0 opacity-15">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <filter id="paperNoise">
                  <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="5" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100" height="100" fill="#fff" filter="url(#paperNoise)" />
              </svg>
            </div>

            {/* Gold double border */}
            <div className="absolute inset-[10px] border-[2px] border-[#D4AF85] opacity-70 rounded-sm z-[1]"></div>
            <div className="absolute inset-[16px] border-[1px] border-[#D4AF85] opacity-50 rounded-sm z-[1]"></div>

            {/* Main SVG with all decorations */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
              <defs>
                {/* 
                  Lotus flower - large blooming 
                  Petals are rounded, cupped shapes opening outward like a real lotus.
                  Multiple layers: outer petals spread wide, inner petals more upright.
                */}
                <g id="lotusUpLg">
                  {/* Outer petals - wide, curved */}
                  <path d="M 0,0 C -4,-2 -14,-12 -10,-18 C -7,-22 -2,-18 0,-10 C 2,-18 7,-22 10,-18 C 14,-12 4,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(-14, 2) rotate(-35, 0, 0)"/>
                  <path d="M 0,0 C -4,-2 -14,-12 -10,-18 C -7,-22 -2,-18 0,-10 C 2,-18 7,-22 10,-18 C 14,-12 4,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(14, 2) rotate(35, 0, 0)"/>
                  {/* Middle petals */}
                  <path d="M 0,0 C -4,-2 -14,-14 -9,-20 C -6,-24 -2,-19 0,-12 C 2,-19 6,-24 9,-20 C 14,-14 4,-2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(-8, -1) rotate(-18, 0, 0)"/>
                  <path d="M 0,0 C -4,-2 -14,-14 -9,-20 C -6,-24 -2,-19 0,-12 C 2,-19 6,-24 9,-20 C 14,-14 4,-2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(8, -1) rotate(18, 0, 0)"/>
                  {/* Inner petals - more upright */}
                  <path d="M 0,0 C -3,-3 -10,-16 -6,-22 C -3,-26 -1,-20 0,-14 C 1,-20 3,-26 6,-22 C 10,-16 3,-3 0,0 Z" fill="#E8C896" opacity="0.85" transform="translate(-3, -2)"/>
                  <path d="M 0,0 C -3,-3 -10,-16 -6,-22 C -3,-26 -1,-20 0,-14 C 1,-20 3,-26 6,-22 C 10,-16 3,-3 0,0 Z" fill="#E8C896" opacity="0.85" transform="translate(3, -2)"/>
                  {/* Center petal */}
                  <path d="M 0,0 C -2,-4 -7,-18 -4,-24 C -2,-27 -0.5,-22 0,-16 C 0.5,-22 2,-27 4,-24 C 7,-18 2,-4 0,0 Z" fill="#F0D8A8" opacity="0.95"/>
                  {/* Center dot */}
                  <circle cx="0" cy="-3" r="2" fill="#D4A050" opacity="0.5"/>
                </g>

                {/* Lotus flower - medium */}
                <g id="lotusUpMd">
                  <path d="M 0,0 C -3,-2 -10,-10 -7,-14 C -5,-17 -1.5,-13 0,-8 C 1.5,-13 5,-17 7,-14 C 10,-10 3,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(-10, 1.5) rotate(-32, 0, 0)"/>
                  <path d="M 0,0 C -3,-2 -10,-10 -7,-14 C -5,-17 -1.5,-13 0,-8 C 1.5,-13 5,-17 7,-14 C 10,-10 3,-2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(10, 1.5) rotate(32, 0, 0)"/>
                  <path d="M 0,0 C -3,-2 -10,-11 -7,-16 C -4.5,-19 -1.5,-15 0,-9 C 1.5,-15 4.5,-19 7,-16 C 10,-11 3,-2 0,0 Z" fill="#E8C896" opacity="0.78" transform="translate(-5.5, -0.5) rotate(-15, 0, 0)"/>
                  <path d="M 0,0 C -3,-2 -10,-11 -7,-16 C -4.5,-19 -1.5,-15 0,-9 C 1.5,-15 4.5,-19 7,-16 C 10,-11 3,-2 0,0 Z" fill="#E8C896" opacity="0.78" transform="translate(5.5, -0.5) rotate(15, 0, 0)"/>
                  <path d="M 0,0 C -2,-3 -7,-14 -4,-18 C -2,-21 -0.5,-16 0,-11 C 0.5,-16 2,-21 4,-18 C 7,-14 2,-3 0,0 Z" fill="#F0D8A8" opacity="0.92"/>
                  <circle cx="0" cy="-2.5" r="1.5" fill="#D4A050" opacity="0.5"/>
                </g>

                {/* Lotus flower - small */}
                <g id="lotusUpSm">
                  <path d="M 0,0 C -2,-1.5 -7,-8 -5,-11 C -3.5,-13 -1,-10 0,-6 C 1,-10 3.5,-13 5,-11 C 7,-8 2,-1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(-6, 1) rotate(-28, 0, 0)"/>
                  <path d="M 0,0 C -2,-1.5 -7,-8 -5,-11 C -3.5,-13 -1,-10 0,-6 C 1,-10 3.5,-13 5,-11 C 7,-8 2,-1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(6, 1) rotate(28, 0, 0)"/>
                  <path d="M 0,0 C -2,-2 -6,-10 -4,-13 C -2,-15.5 -0.5,-12 0,-8 C 0.5,-12 2,-15.5 4,-13 C 6,-10 2,-2 0,0 Z" fill="#F0D8A8" opacity="0.9"/>
                  <circle cx="0" cy="-2" r="1.2" fill="#D4A050" opacity="0.5"/>
                </g>

                {/* Lotus bud - tiny */}
                <g id="lotusBud">
                  <path d="M 0,0 C -1.5,-1.5 -5,-7 -3,-10 C -1.5,-12 -0.5,-9 0,-5.5 C 0.5,-9 1.5,-12 3,-10 C 5,-7 1.5,-1.5 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(-3, 0.5) rotate(-18, 0, 0)"/>
                  <path d="M 0,0 C -1.5,-1.5 -5,-7 -3,-10 C -1.5,-12 -0.5,-9 0,-5.5 C 0.5,-9 1.5,-12 3,-10 C 5,-7 1.5,-1.5 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(3, 0.5) rotate(18, 0, 0)"/>
                  <path d="M 0,0 C -1,-2 -4,-8 -2.5,-10.5 C -1,-12.5 -0.3,-9 0,-6 C 0.3,-9 1,-12.5 2.5,-10.5 C 4,-8 1,-2 0,0 Z" fill="#F0D8A8" opacity="0.9"/>
                  <circle cx="0" cy="-1.5" r="0.9" fill="#D4A050" opacity="0.5"/>
                </g>

                {/* Hanging lotus (petals fan downward) - large */}
                <g id="lotusHangLg">
                  <path d="M 0,0 C -4,2 -14,12 -10,18 C -7,22 -2,18 0,10 C 2,18 7,22 10,18 C 14,12 4,2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(-14, -2) rotate(35, 0, 0)"/>
                  <path d="M 0,0 C -4,2 -14,12 -10,18 C -7,22 -2,18 0,10 C 2,18 7,22 10,18 C 14,12 4,2 0,0 Z" fill="#E8C896" opacity="0.65" transform="translate(14, -2) rotate(-35, 0, 0)"/>
                  <path d="M 0,0 C -4,2 -14,14 -9,20 C -6,24 -2,19 0,12 C 2,19 6,24 9,20 C 14,14 4,2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(-8, 1) rotate(18, 0, 0)"/>
                  <path d="M 0,0 C -4,2 -14,14 -9,20 C -6,24 -2,19 0,12 C 2,19 6,24 9,20 C 14,14 4,2 0,0 Z" fill="#E8C896" opacity="0.75" transform="translate(8, 1) rotate(-18, 0, 0)"/>
                  <path d="M 0,0 C -2,4 -7,18 -4,24 C -2,27 -0.5,22 0,16 C 0.5,22 2,27 4,24 C 7,18 2,4 0,0 Z" fill="#F0D8A8" opacity="0.95"/>
                  <circle cx="0" cy="3" r="2" fill="#D4A050" opacity="0.5"/>
                </g>

                {/* Hanging lotus - small */}
                <g id="lotusHangSm">
                  <path d="M 0,0 C -2,1.5 -7,8 -5,11 C -3.5,13 -1,10 0,6 C 1,10 3.5,13 5,11 C 7,8 2,1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(-6, -1) rotate(28, 0, 0)"/>
                  <path d="M 0,0 C -2,1.5 -7,8 -5,11 C -3.5,13 -1,10 0,6 C 1,10 3.5,13 5,11 C 7,8 2,1.5 0,0 Z" fill="#E8C896" opacity="0.7" transform="translate(6, -1) rotate(-28, 0, 0)"/>
                  <path d="M 0,0 C -2,2 -6,10 -4,13 C -2,15.5 -0.5,12 0,8 C 0.5,12 2,15.5 4,13 C 6,10 2,2 0,0 Z" fill="#F0D8A8" opacity="0.9"/>
                  <circle cx="0" cy="2" r="1.2" fill="#D4A050" opacity="0.5"/>
                </g>

                {/* Stem leaf node - single small leaf pair */}
                <g id="leafNode">
                  <path d="M -3,0.5 C -5,-2 -7,-6 -5,-8 C -3,-10 -1,-5 0,-2 C 1,-5 3,-10 5,-8 C 7,-6 5,-2 3,0.5" fill="#E8C896" opacity="0.8"/>
                </g>

                {/* Hanging leaf node (flipped downward) */}
                <g id="leafNodeHang">
                  <path d="M -3,-0.5 C -5,2 -7,6 -5,8 C -3,10 -1,5 0,2 C 1,5 3,10 5,8 C 7,6 5,2 3,-0.5" fill="#E8C896" opacity="0.8"/>
                </g>

                {/* Small teardrop pendant for chains */}
                <g id="teardrop">
                  <path d="M 0 -2 Q 2 2, 0 5 Q -2 2, 0 -2 Z" fill="#E8C896" opacity="0.8"/>
                </g>
              </defs>

              {/* ===== TOP: 6 hanging flowers, 3 per side ===== */}
              
              {/* LEFT SIDE - 3 flowers */}
              {/* Left 1 (leftmost, small) - 1 leaf */}
              <g>
                <line x1="40" y1="0" x2="40" y2="95" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                <use href="#lotusHangSm" x="40" y="91"/>
                <use href="#leafNodeHang" x="40" y="50"/>
              </g>
              {/* Left 2 (middle of group, biggest) - 3 leaves */}
              <g>
                <line x1="65" y1="0" x2="65" y2="140" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                <use href="#lotusHangLg" x="65" y="135"/>
                <use href="#leafNodeHang" x="65" y="40"/>
                <use href="#leafNodeHang" x="65" y="72"/>
                <use href="#leafNodeHang" x="65" y="104"/>
              </g>
              {/* Left 3 (rightmost of group, slightly smaller than left 1) - 1 leaf */}
              <g>
                <line x1="90" y1="0" x2="90" y2="88" stroke="#D4AF85" strokeWidth="0.65" opacity="0.75"/>
                <use href="#lotusHangSm" x="90" y="84"/>
                <use href="#leafNodeHang" x="90" y="45"/>
              </g>

              {/* RIGHT SIDE - 3 flowers (mirrored) */}
              {/* Right 1 (leftmost of group, slightly smaller than right 3) - 1 leaf */}
              <g>
                <line x1="270" y1="0" x2="270" y2="88" stroke="#D4AF85" strokeWidth="0.65" opacity="0.75"/>
                <use href="#lotusHangSm" x="270" y="84"/>
                <use href="#leafNodeHang" x="270" y="45"/>
              </g>
              {/* Right 2 (middle of group, biggest) - 3 leaves */}
              <g>
                <line x1="295" y1="0" x2="295" y2="140" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                <use href="#lotusHangLg" x="295" y="135"/>
                <use href="#leafNodeHang" x="295" y="40"/>
                <use href="#leafNodeHang" x="295" y="72"/>
                <use href="#leafNodeHang" x="295" y="104"/>
              </g>
              {/* Right 3 (rightmost, small) - 1 leaf */}
              <g>
                <line x1="320" y1="0" x2="320" y2="95" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                <use href="#lotusHangSm" x="320" y="91"/>
                <use href="#leafNodeHang" x="320" y="50"/>
              </g>

              {/* ===== JANTI BADGE (only if guest name provided) ===== */}
              {guestName && (
                <g transform="translate(180, 18) scale(1.3)">
                  {/* Ribbon tails hanging down */}
                  <path d="M -8,38 L -14,95 L -6,80 L 0,95 L 2,38" fill="#8B1A2B" opacity="0.85"/>
                  <path d="M -2,38 L 0,95 L 6,80 L 14,95 L 8,38" fill="#A02035" opacity="0.85"/>
                  
                  {/* Ribbon bow - left loop */}
                  <path d="M -2,30 C -18,22 -28,32 -20,38 C -12,44 -4,36 -2,30" fill="#8B1A2B" opacity="0.9"/>
                  {/* Ribbon bow - right loop */}
                  <path d="M 2,30 C 18,22 28,32 20,38 C 12,44 4,36 2,30" fill="#A02035" opacity="0.9"/>
                  {/* Bow center knot */}
                  <ellipse cx="0" cy="32" rx="4" ry="5" fill="#7A1525"/>
                  
                  {/* Badge circle - white/cream background */}
                  <circle cx="0" cy="14" r="22" fill="#FFF8F0" stroke="#D4AF85" strokeWidth="1.2"/>
                  {/* Scalloped/ruffled edge */}
                  <circle cx="0" cy="14" r="24" fill="none" stroke="#C41E3A" strokeWidth="2.5" strokeDasharray="3,3" opacity="0.7"/>
                  
                  {/* Lines on the badge (like nepali kagaz) */}
                  <line x1="-14" y1="8" x2="14" y2="8" stroke="#D4AF85" strokeWidth="0.4" opacity="0.5"/>
                  <line x1="-14" y1="14" x2="14" y2="14" stroke="#D4AF85" strokeWidth="0.4" opacity="0.5"/>
                  <line x1="-14" y1="20" x2="14" y2="20" stroke="#D4AF85" strokeWidth="0.4" opacity="0.5"/>
                  
                  {/* Guest name on the badge */}
                  <text x="0" y="16" textAnchor="middle" fill="#8B1A2B" fontSize="7" fontFamily="'Playfair Display', serif" fontWeight="600">{guestName}</text>
                </g>
              )}

              {/* ===== CENTER: Entangled calligraphic flourish around text ===== */}
              {/* This starts above the first letters, swoops down and loops across the entire word */}
              <g transform="translate(180, 265)" opacity="0.8">
                {/* Main flourish line - starts top-left above नि, curves up, swoops down and right across the word, then loops back */}
                {/* Starting curl above left side */}
                <path d="M -75 -18 C -82 -24, -88 -18, -85 -12 C -82 -6, -74 -10, -75 -18" stroke="#D4AF85" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                {/* Swoop from top-left down to bottom-center and looping right */}
                <path d="M -75 -14 C -65 -8, -55 15, -30 22 C -5 29, 20 28, 40 22 C 60 16, 70 5, 55 -2 C 40 -9, 15 -5, -5 5 C -25 15, -45 22, -55 15 C -65 8, -55 -2, -40 2 C -25 6, -5 15, 20 18 C 45 21, 65 15, 75 5" stroke="#D4AF85" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                {/* Ending curl on right side */}
                <path d="M 75 5 C 80 -2, 85 2, 82 8 C 79 14, 73 10, 75 5" stroke="#D4AF85" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
              </g>

              {/* ===== BOTTOM LEFT cluster: ~7 flowers ===== */}
              {/* Tallest - inner edge, large bloom - 3 leaf nodes */}
              <g>
                <line x1="120" y1="555" x2="120" y2="385" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                <use href="#lotusUpLg" x="120" y="387"/>
                <use href="#leafNode" x="120" y="520"/>
                <use href="#leafNode" x="120" y="480"/>
                <use href="#leafNode" x="120" y="440"/>
              </g>
              {/* Second tallest - 2 leaf nodes */}
              <g>
                <line x1="100" y1="555" x2="100" y2="385" stroke="#D4AF85" strokeWidth="0.9" opacity="0.88"/>
                <use href="#lotusUpMd" x="100" y="387"/>
                <use href="#leafNode" x="100" y="510"/>
                <use href="#leafNode" x="100" y="460"/>
              </g>
              {/* Medium tall - 2 leaf nodes */}
              <g>
                <line x1="78" y1="555" x2="78" y2="410" stroke="#D4AF85" strokeWidth="0.9" opacity="0.85"/>
                <use href="#lotusUpMd" x="78" y="412"/>
                <use href="#leafNode" x="78" y="515"/>
                <use href="#leafNode" x="78" y="470"/>
              </g>
              {/* Shorter, large bloom - 1 leaf node */}
              <g>
                <line x1="55" y1="555" x2="55" y2="435" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                <use href="#lotusUpLg" x="55" y="437"/>
                <use href="#leafNode" x="55" y="510"/>
              </g>
              {/* Short small - 1 leaf node */}
              <g>
                <line x1="38" y1="555" x2="38" y2="470" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                <use href="#lotusUpSm" x="38" y="472"/>
                <use href="#leafNode" x="38" y="520"/>
              </g>
              {/* Tiny bud front - no nodes */}
              <g>
                <line x1="68" y1="555" x2="68" y2="485" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                <use href="#lotusBud" x="68" y="487"/>
              </g>
              {/* Small one near edge - no nodes */}
              <g>
                <line x1="28" y1="555" x2="28" y2="500" stroke="#D4AF85" strokeWidth="0.6" opacity="0.7"/>
                <use href="#lotusBud" x="28" y="502"/>
              </g>

              {/* ===== BOTTOM RIGHT cluster: ~7 flowers (mirrored) ===== */}
              {/* Tallest - inner edge - 3 leaf nodes */}
              <g>
                <line x1="240" y1="555" x2="240" y2="385" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                <use href="#lotusUpLg" x="240" y="387"/>
                <use href="#leafNode" x="240" y="520"/>
                <use href="#leafNode" x="240" y="480"/>
                <use href="#leafNode" x="240" y="440"/>
              </g>
              {/* Second tallest - 2 leaf nodes */}
              <g>
                <line x1="260" y1="555" x2="260" y2="385" stroke="#D4AF85" strokeWidth="0.9" opacity="0.88"/>
                <use href="#lotusUpMd" x="260" y="387"/>
                <use href="#leafNode" x="260" y="510"/>
                <use href="#leafNode" x="260" y="460"/>
              </g>
              {/* Medium tall - 2 leaf nodes */}
              <g>
                <line x1="282" y1="555" x2="282" y2="410" stroke="#D4AF85" strokeWidth="0.9" opacity="0.85"/>
                <use href="#lotusUpMd" x="282" y="412"/>
                <use href="#leafNode" x="282" y="515"/>
                <use href="#leafNode" x="282" y="470"/>
              </g>
              {/* Shorter, large bloom - 1 leaf node */}
              <g>
                <line x1="305" y1="555" x2="305" y2="435" stroke="#D4AF85" strokeWidth="1" opacity="0.9"/>
                <use href="#lotusUpLg" x="305" y="437"/>
                <use href="#leafNode" x="305" y="510"/>
              </g>
              {/* Short small - 1 leaf node */}
              <g>
                <line x1="322" y1="555" x2="322" y2="470" stroke="#D4AF85" strokeWidth="0.7" opacity="0.8"/>
                <use href="#lotusUpSm" x="322" y="472"/>
                <use href="#leafNode" x="322" y="520"/>
              </g>
              {/* Tiny bud */}
              <g>
                <line x1="292" y1="555" x2="292" y2="485" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                <use href="#lotusBud" x="292" y="487"/>
              </g>
              {/* Small one near edge */}
              <g>
                <line x1="335" y1="555" x2="335" y2="500" stroke="#D4AF85" strokeWidth="0.6" opacity="0.7"/>
                <use href="#lotusBud" x="335" y="502"/>
              </g>

              {/* ===== BOTTOM CENTER fill flowers ===== */}
              <g>
                <line x1="155" y1="555" x2="155" y2="460" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                <use href="#lotusBud" x="155" y="462"/>
              </g>
              <g>
                <line x1="180" y1="555" x2="180" y2="430" stroke="#D4AF85" strokeWidth="0.8" opacity="0.85"/>
                <use href="#lotusUpMd" x="180" y="432"/>
                <use href="#leafNode" x="180" y="510"/>
              </g>
              <g>
                <line x1="205" y1="555" x2="205" y2="460" stroke="#D4AF85" strokeWidth="0.6" opacity="0.75"/>
                <use href="#lotusBud" x="205" y="462"/>
              </g>
            </svg>

            {/* Center Text - निमन्त्रणा positioned slightly above center */}
            <div className="absolute inset-0 flex flex-col items-center z-10" style={{ justifyContent: 'center', paddingBottom: '18%' }}>
              <motion.div
                className="text-center"
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-[#E8C896] text-5xl md:text-6xl font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 0 15px rgba(232,200,150,0.4), 0 2px 4px rgba(0,0,0,0.2)' }}>
                  निमन्त्रणा
                </div>
              </motion.div>
            </div>

            {/* Tap indicator */}
            <motion.div
              className="absolute bottom-4 left-0 right-0 text-center z-20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-[#D4AF85] text-xs uppercase tracking-widest font-light">Tap to open</span>
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Instructions below card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <motion.p
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[#C41E3A] text-sm md:text-base uppercase tracking-widest font-light"
          >
            Tap the card to begin
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
