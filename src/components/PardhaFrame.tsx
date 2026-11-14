import React from 'react';

// Wedding-style draped pardha for the photo: slim maroon drapes over a sheer ivory layer,
// gold-embroidered edges, a lotus medallion on a scalloped valance with pearl drops,
// and ribbon-bow tiebacks with little heart charms.
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
      {/* heavy curtain body, pinched at the tieback (y=250) */}
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

function Heart({ x, y, s = 1, fill = '#c2203a' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 0 C -3 -4 -8 0 0 7 C 8 0 3 -4 0 0 Z"
      fill={fill}
    />
  );
}

// ribbon-bow tieback with a little heart charm
function BowTie({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* rope band around the drape */}
      <path d="M-12 -3 C -4 3 4 3 12 -3 L12 3 C 4 9 -4 9 -12 3 Z" fill={gold} />
      <path d="M-12 -2 C -4 4 4 4 12 -2" stroke={goldLt} strokeWidth="1" fill="none" />
      {/* tails */}
      <path d="M0 3 L-6 17 L-2 15 L0 19 Z" fill="#e8c25f" />
      <path d="M0 3 L6 17 L2 15 L0 19 Z" fill="#e8c25f" />
      {/* bow loops */}
      <path d="M0 0 C -8 -10 -15 -4 -12 2 C -9 7 -3 3 0 0 Z" fill={goldLt} stroke={gold} strokeWidth="0.8" />
      <path d="M0 0 C 8 -10 15 -4 12 2 C 9 7 3 3 0 0 Z" fill={goldLt} stroke={gold} strokeWidth="0.8" />
      <circle cx="0" cy="0" r="2.6" fill={gold} />
      {/* heart charm on a tiny chain */}
      <path d="M0 19 L0 24" stroke={gold} strokeWidth="1" />
      <Heart x={0} y={24} s={0.9} />
    </g>
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

        {/* tieback bows */}
        <BowTie x={22} y={245} />
        <BowTie x={278} y={245} />

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
        {/* inner gold lace line */}
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

        {/* lotus medallion in the center of the valance */}
        <g transform="translate(150 24)">
          <circle r="15" fill="#7d0e20" stroke={gold} strokeWidth="1.6" />
          <circle r="12" fill="none" stroke={goldLt} strokeWidth="0.8" strokeDasharray="1 2.5" />
          {[-52, -26, 26, 52].map((a) => (
            <ellipse key={a} cx="0" cy="-5" rx="3.4" ry="7" fill="#f6c9cf" stroke={gold} strokeWidth="0.5" transform={`rotate(${a})`} />
          ))}
          <ellipse cx="0" cy="-5" rx="3.6" ry="8" fill="#fff1ea" stroke={gold} strokeWidth="0.6" />
          <circle cy="3" r="1.8" fill={gold} />
        </g>

        {/* tiny hearts flanking the medallion */}
        <Heart x={122} y={14} s={0.8} fill={goldLt} />
        <Heart x={178} y={14} s={0.8} fill={goldLt} />
      </svg>
    </div>
  );
}
