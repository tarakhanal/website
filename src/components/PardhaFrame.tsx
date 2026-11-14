import React from 'react';

// Wedding-style draped pardha for the photo: maroon drapes over a sheer ivory layer,
// gold-embroidered edges, and a scalloped valance with pearl drops. A cute Pichwai-style
// (Krishna art) peacock stands on each side, out in the margin beside the frame.
// Drawn in a fixed 300x400 viewBox (same 3:4 ratio as the photo), so the opened page and
// the mini flying preview card scale identically.
const gold = '#d9b25c';
const goldLt = '#f3dc9a';
const pearl = '#fff6e6';

// curtain width factor (0.5 was the previous, slimmer version)
const W = 0.56;

function Drape({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? `translate(300 0) scale(-${W} 1)` : `scale(${W} 1)`}>
      <path
        d="M0 0 L112 0 C104 80 126 160 112 250 C100 310 122 360 104 400 L0 400 Z"
        fill="#fff6e6"
        opacity="0.28"
      />
      <path
        d="M0 0 L78 0 C70 70 100 150 84 250 C70 300 96 360 74 400 L0 400 Z"
        fill="url(#pardhaRed)"
      />
      <path d="M18 0 C14 120 22 260 10 400" stroke="#4a0712" strokeWidth="2.2" opacity="0.35" fill="none" />
      <path d="M34 0 C30 100 44 200 30 400" stroke="#e24a5e" strokeWidth="1.6" opacity="0.28" fill="none" />
      <path d="M50 0 C46 90 66 190 54 400" stroke="#4a0712" strokeWidth="2.2" opacity="0.3" fill="none" />
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

// One tail feather with a gold-ringed blue "eye"
function Feather({ a, len = 54, eye = 44, rx = 6, ry = 7.5 }: { a: number; len?: number; eye?: number; rx?: number; ry?: number }) {
  return (
    <g transform={`rotate(${a})`}>
      <path d={`M0 0 C-9 -18 -9 -${len - 14} 0 -${len} C9 -${len - 14} 9 -18 0 0Z`} fill="#14806a" />
      <ellipse cy={-eye} rx={rx} ry={ry} fill={gold} />
      <ellipse cy={-eye} rx={rx - 1.6} ry={ry - 1.7} fill="#2a5db0" />
      <ellipse cy={-eye} rx={rx - 4} ry={ry - 4.7} fill="#0e9aa7" />
    </g>
  );
}

// A cute Krishna-art style peacock facing right (flip for the other side)
function Peacock({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="-25 0 125 120"
      className="w-full h-full"
      style={{ transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* fanned tail */}
      <g transform="translate(40 78)">
        <Feather a={-70} len={54} eye={44} />
        <Feather a={-35} len={58} eye={47} />
        <Feather a={0} len={58} eye={47} />
        <Feather a={35} len={54} eye={44} />
        <Feather a={62} len={42} eye={34} rx={5} ry={6.2} />
      </g>
      {/* body */}
      <path d="M30 74 C28 98 46 106 60 98 C72 90 68 70 56 62 C46 56 32 60 30 74Z" fill="#1b6fa8" />
      <path d="M38 80 C38 94 50 98 58 92 C62 86 58 76 50 72 C44 70 38 74 38 80Z" fill="#3aa6c4" opacity=".75" />
      <path d="M44 84 q6 -6 12 0 M43 90 q7 -6 14 0" stroke={gold} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* curved neck */}
      <path d="M52 66 C66 62 70 48 62 40 C58 36 60 30 64 28 L70 30 C70 36 66 38 70 44 C76 54 70 70 56 76 Z" fill="#1b6fa8" />
      <path d="M60 70 C68 64 70 56 66 50" stroke="#3aa6c4" strokeWidth="3" fill="none" opacity=".6" strokeLinecap="round" />
      {/* gold necklace with ruby */}
      <path d="M56 62 C62 66 68 62 70 56" stroke={gold} strokeWidth="1.6" fill="none" />
      <circle cx="63" cy="66" r="1.8" fill="#e8486a" />
      {/* head */}
      <circle cx="67" cy="27" r="7" fill="#1b6fa8" />
      <circle cx="69.5" cy="25.5" r="3" fill="#fff" />
      <circle cx="70.4" cy="25.6" r="1.8" fill="#1a1a1a" />
      <circle cx="71" cy="24.8" r=".6" fill="#fff" />
      <path d="M73 28 L80 31 L73 33Z" fill="#e8a23a" />
      <ellipse cx="66" cy="30" rx="2.2" ry="1.4" fill="#f08aa0" opacity=".7" />
      {/* crest: three gem-tipped feathers */}
      <path d="M63 21 C60 14 58 10 57 6 M67 20 C67 13 67 9 68 4 M71 21 C74 14 76 10 79 7" stroke={gold} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="57" cy="5" r="2.4" fill="#2a5db0" stroke={gold} strokeWidth=".8" />
      <circle cx="68" cy="3" r="2.6" fill="#e8486a" stroke={gold} strokeWidth=".8" />
      <circle cx="79.5" cy="6" r="2.4" fill="#2a5db0" stroke={gold} strokeWidth=".8" />
      {/* feet */}
      <path d="M44 100 L43 112 M52 100 L53 112 M40 112 L46 112 M50 112 L56 112" stroke={gold} strokeWidth="1.6" strokeLinecap="round" />
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
        {[31, 81, 131, 181, 231, 281].map((x) => (
          <g key={x}>
            <path d={`M${x} 36 L${x} 41`} stroke={gold} strokeWidth="1" />
            <circle cx={x} cy="44" r="3" fill={pearl} stroke={gold} strokeWidth="0.8" />
          </g>
        ))}
        <rect x="-6" y="-6" width="312" height="6" fill={gold} />
      </svg>

      {/* peacocks in the side margins, clear of the frame */}
      <div
        className="absolute pointer-events-none"
        style={{ left: '-17%', bottom: '-2%', width: '15%', aspectRatio: '125/120' }}
      >
        <Peacock />
      </div>
      <div
        className="absolute pointer-events-none"
        style={{ right: '-17%', bottom: '-2%', width: '15%', aspectRatio: '125/120' }}
      >
        <Peacock flip />
      </div>
    </div>
  );
}
