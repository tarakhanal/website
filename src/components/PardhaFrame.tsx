import React from 'react';

// Wedding-style draped pardha for the photo: slim maroon drapes over a sheer ivory layer,
// gold-embroidered edges, and a scalloped valance with pearl drops. A little peacock
// stands on each side, out in the margin beside the frame.
// Drawn in a fixed 300x400 viewBox (same 3:4 ratio as the photo), so the opened page and
// the mini flying preview card scale identically.
const gold = '#d9b25c';
const goldLt = '#f3dc9a';
const pearl = '#fff6e6';

function Drape({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? 'translate(300 0) scale(-0.5 1)' : 'scale(0.5 1)'}>
      {/* sheer ivory voile behind the heavy drape */}
      <path
        d="M0 0 L112 0 C104 80 126 160 112 250 C100 310 122 360 104 400 L0 400 Z"
        fill="#fff6e6"
        opacity="0.28"
      />
      {/* heavy curtain body */}
      <path
        d="M0 0 L78 0 C70 70 100 150 84 250 C70 300 96 360 74 400 L0 400 Z"
        fill="url(#pardhaRed)"
      />
      {/* pleats */}
      <path d="M18 0 C14 120 22 260 10 400" stroke="#4a0712" strokeWidth="2.2" opacity="0.35" fill="none" />
      <path d="M34 0 C30 100 44 200 30 400" stroke="#e24a5e" strokeWidth="1.6" opacity="0.28" fill="none" />
      <path d="M50 0 C46 90 66 190 54 400" stroke="#4a0712" strokeWidth="2.2" opacity="0.3" fill="none" />
      {/* gold-embroidered inner edge */}
      <path
        d="M78 0 C70 70 100 150 84 250 C70 300 96 360 74 400"
        stroke={goldLt}
        strokeWidth="2"
        opacity="0.85"
        fill="none"
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      <path
        d="M70 0 C62 70 92 150 76 250 C62 300 88 360 66 400"
        stroke={gold}
        strokeWidth="1"
        opacity="0.6"
        fill="none"
      />
    </g>
  );
}

// A cute little peacock facing right (flip it for the other side)
function Peacock({ flip }: { flip?: boolean }) {
  const feathers = [-62, -31, 0, 31, 62];
  return (
    <svg
      viewBox="0 0 64 90"
      className="w-full h-full"
      style={{ transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* tail fan */}
      <g transform="translate(24 66)">
        {feathers.map((a) => (
          <g key={a} transform={`rotate(${a - 30})`}>
            <path d="M0 0 C -7 -14 -7 -30 0 -40 C 7 -30 7 -14 0 0 Z" fill="#1f8a70" opacity="0.92" />
            <ellipse cx="0" cy="-31" rx="4.2" ry="5.4" fill="#2a5db0" stroke={gold} strokeWidth="0.8" />
            <ellipse cx="0" cy="-31" rx="1.7" ry="2.4" fill="#0e8c9a" />
          </g>
        ))}
      </g>
      {/* body */}
      <ellipse cx="32" cy="64" rx="10" ry="14" fill="#1b6fa8" transform="rotate(-14 32 64)" />
      <ellipse cx="33" cy="67" rx="5" ry="8" fill="#3aa6c4" opacity="0.7" transform="rotate(-14 33 67)" />
      {/* neck */}
      <path d="M34 56 C 42 46 44 36 40 28 L46 28 C 50 38 48 50 40 62 Z" fill="#1b6fa8" />
      {/* head */}
      <circle cx="43" cy="26" r="5" fill="#1b6fa8" />
      <circle cx="44.6" cy="25" r="1" fill="#fff" />
      <circle cx="44.9" cy="25" r="0.5" fill="#222" />
      <path d="M47 27 L52 29 L47 30 Z" fill={gold} />
      {/* crest */}
      <path d="M41 21 L39 12 M43 21 L43 10 M45 21 L47 12" stroke={gold} strokeWidth="1" strokeLinecap="round" />
      <circle cx="39" cy="11.5" r="1.5" fill="#e8486a" />
      <circle cx="43" cy="9.5" r="1.5" fill="#e8486a" />
      <circle cx="47" cy="11.5" r="1.5" fill="#e8486a" />
      {/* little feet */}
      <path d="M30 77 L29 86 M35 77 L36 86" stroke={gold} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function PardhaFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ background: '#fbf1e3' }}>
      {/* photo with warm album tone, soft vignette */}
      <div
        className="relative w-full overflow-hidden"
        style={{ filter: 'sepia(18%) saturate(1.1) contrast(1.04) brightness(1.04)' }}
      >
        {children}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,240,215,0) 50%, rgba(120,30,40,0.22) 100%)' }}
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
            <stop offset="0" stopColor="#9a1128" />
            <stop offset="1" stopColor="#6e0c1c" />
          </linearGradient>
        </defs>

        <Drape />
        <Drape flip />

        {/* scalloped valance */}
        <path
          d="M-6 -6 L306 -6 L306 20 Q 281 42 256 20 Q 231 42 206 20 Q 181 42 156 20 Q 131 42 106 20 Q 81 42 56 20 Q 31 42 6 20 L-6 20 Z"
          fill="url(#pardhaValance)"
        />
        <path
          d="M-6 20 L6 20 Q 31 42 56 20 Q 81 42 106 20 Q 131 42 156 20 Q 181 42 206 20 Q 231 42 256 20 Q 281 42 306 20"
          fill="none"
          stroke={gold}
          strokeWidth="2"
        />
        <path
          d="M6 14 Q 31 34 56 14 Q 81 34 106 14 Q 131 34 156 14 Q 181 34 206 14 Q 231 34 256 14 Q 281 34 306 14"
          fill="none"
          stroke={goldLt}
          strokeWidth="1"
          strokeDasharray="1 4"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* pearl drops at each scallop dip */}
        {[31, 81, 131, 181, 231, 281].map((x) => (
          <g key={x}>
            <path d={`M${x} 36 L${x} 41`} stroke={gold} strokeWidth="1" />
            <circle cx={x} cy="44" r="3" fill={pearl} stroke={gold} strokeWidth="0.8" />
          </g>
        ))}
        <rect x="-6" y="-6" width="312" height="6" fill={gold} />
      </svg>

      {/* peacocks standing in the side margins, clear of the frame */}
      <div
        className="absolute pointer-events-none"
        style={{ left: '-19%', bottom: '-2%', width: '15%', aspectRatio: '64/90' }}
      >
        <Peacock />
      </div>
      <div
        className="absolute pointer-events-none"
        style={{ right: '-19%', bottom: '-2%', width: '15%', aspectRatio: '64/90' }}
      >
        <Peacock flip />
      </div>
    </div>
  );
}
