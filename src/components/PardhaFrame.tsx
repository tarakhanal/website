import React from 'react';

// Draped pardha (curtain) frame for the photo: maroon curtains pulled back with gold tiebacks,
// a scalloped valance with gold fringe, and a warm wedding-album tone on the photo itself.
// Drawn in a fixed 300x400 viewBox (same 3:4 ratio as the photo), so the opened page and the mini
// flying preview card scale identically with no per-size tuning.
const gold = '#d9b25c';
const goldLt = '#f3dc9a';

function Drape({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? 'translate(300 0) scale(-0.68 1)' : 'scale(0.68 1)'}>
      {/* curtain body, pinched at the tieback (y=250) and flaring at the bottom */}
      <path
        d="M0 0 L78 0 C70 70 100 150 84 250 C70 300 96 360 74 400 L0 400 Z"
        fill="url(#pardhaRed)"
      />
      {/* pleats */}
      <path d="M18 0 C14 120 22 260 10 400" stroke="#4a0712" strokeWidth="2.2" opacity="0.35" fill="none" />
      <path d="M34 0 C30 100 44 200 30 400" stroke="#e24a5e" strokeWidth="1.6" opacity="0.28" fill="none" />
      <path d="M50 0 C46 90 66 190 54 400" stroke="#4a0712" strokeWidth="2.2" opacity="0.3" fill="none" />
      <path d="M66 0 C62 90 90 170 76 250 C66 310 86 360 68 400" stroke="#e24a5e" strokeWidth="1.4" opacity="0.25" fill="none" />
      {/* inner edge highlight */}
      <path d="M78 0 C70 70 100 150 84 250 C70 300 96 360 74 400" stroke={goldLt} strokeWidth="1.4" opacity="0.7" fill="none" />
      {/* tieback band + tassel */}
      <path d="M-2 238 C30 252 62 252 90 240 L92 252 C62 266 28 266 -2 252 Z" fill={gold} />
      <path d="M-2 240 C30 254 62 254 90 242" stroke={goldLt} strokeWidth="1.4" fill="none" />
      <circle cx="46" cy="262" r="5" fill="#a8132a" stroke={gold} strokeWidth="1.5" />
      <path d="M40 267 L38 292 M44 268 L43 296 M48 268 L49 296 M52 267 L54 292" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="270" r="3" fill={gold} />
    </g>
  );
}

export default function PardhaFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ background: '#fbf1e3' }}>
      {/* photo with warm album tone, soft vignette */}
      <div className="relative w-full overflow-hidden" style={{ filter: 'sepia(22%) saturate(1.12) contrast(1.05) brightness(1.04)' }}>
        {children}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,240,215,0) 45%, rgba(120,30,40,0.28) 100%)' }}
        />
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{ height: '22%', background: 'linear-gradient(to top, rgba(251,241,227,0.85), rgba(251,241,227,0))' }}
        />
      </div>

      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pardhaRed" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6e0c1c" />
            <stop offset="0.55" stopColor="#a8132a" />
            <stop offset="1" stopColor="#7d0e20" />
          </linearGradient>
          <linearGradient id="pardhaValance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8d1024" />
            <stop offset="1" stopColor="#6e0c1c" />
          </linearGradient>
        </defs>

        <Drape />
        <Drape flip />

        {/* scalloped valance */}
        <path
          d="M-6 -6 L306 -6 L306 22 Q 281 44 256 22 Q 231 44 206 22 Q 181 44 156 22 Q 131 44 106 22 Q 81 44 56 22 Q 31 44 6 22 L-6 22 Z"
          fill="url(#pardhaValance)"
        />
        <path
          d="M-6 22 Q 6 22 6 22 Q 31 44 56 22 Q 81 44 106 22 Q 131 44 156 22 Q 181 44 206 22 Q 231 44 256 22 Q 281 44 306 22"
          fill="none"
          stroke={gold}
          strokeWidth="2"
        />
        {[6, 56, 106, 156, 206, 256].map((x) => (
          <g key={x}>
            <circle cx={x + 25} cy="35" r="2.4" fill={goldLt} />
            <path d={`M${x + 25} 38 L${x + 25} 46`} stroke={gold} strokeWidth="1.2" />
            <circle cx={x + 25} cy="48" r="1.8" fill={gold} />
          </g>
        ))}
        <rect x="-6" y="-6" width="312" height="7" fill={gold} />
      </svg>
    </div>
  );
}
