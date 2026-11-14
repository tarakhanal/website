// Gathbandhan: the Nepali/Hindu wedding knot, where the couple's cloths are tied together.
// Sized in % of the polaroid so the opened page and the flying preview card stay identical.
export default function GathbandhanKnot() {
  const dots = [
    [10, 14], [24, 17], [38, 22], [52, 27], [66, 30], [80, 32], // red cloth (gold flowers)
  ];
  const dotsR = [
    [190, 14], [176, 17], [162, 22], [148, 27], [134, 30], [120, 32], // gold cloth (red flowers)
  ];
  return (
    <svg
      className="absolute pointer-events-none"
      style={{ zIndex: 5, top: 0, left: '14%', width: '72%', transform: 'translateY(-40%) rotate(-1deg)', overflow: 'visible', filter: 'drop-shadow(0 3px 3px rgba(60,20,10,0.25))' }}
      viewBox="0 0 200 90"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gbRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9283f" />
          <stop offset="1" stopColor="#a50f26" />
        </linearGradient>
        <linearGradient id="gbGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e2a0" />
          <stop offset="1" stopColor="#e3bf6a" />
        </linearGradient>
      </defs>

      {/* tails (behind the knot) */}
      <path d="M90 46 C84 58 80 68 76 82 L94 84 C97 72 100 60 104 48 Z" fill="url(#gbRed)" />
      <path d="M76 82 L94 84 L94.5 79 L75.5 77.2 Z" fill="#f08a24" />
      <path d="M96 46 C100 58 108 68 114 82 L132 78 C124 68 114 56 108 46 Z" fill="url(#gbGold)" />
      <path d="M114 82 L132 78 L131 73 L113 77.5 Z" fill="#f08a24" />
      <circle cx="86" cy="62" r="1.6" fill="#f5d77a" /><circle cx="90" cy="72" r="1.6" fill="#f5d77a" />
      <circle cx="108" cy="62" r="1.6" fill="#c8102e" /><circle cx="118" cy="70" r="1.6" fill="#c8102e" />

      {/* red cloth, left */}
      <path d="M0 8 C28 2 60 14 92 26 L92 48 C60 38 30 40 0 32 Z" fill="url(#gbRed)" />
      <path d="M0 14 C30 10 60 22 92 33" fill="none" stroke="#8c0c20" strokeWidth="0.8" opacity="0.5" />
      <path d="M0 24 C30 24 60 32 92 40" fill="none" stroke="#8c0c20" strokeWidth="0.8" opacity="0.4" />
      <path d="M0 29 C30 31 60 37 92 44" fill="none" stroke="#f5d77a" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.85" />
      {dots.map(([x, y], i) => (
        <g key={'r' + i}>
          <circle cx={x} cy={y + 6} r="2.4" fill="#f5d77a" />
          <circle cx={x} cy={y + 6} r="0.9" fill="#d9283f" />
        </g>
      ))}

      {/* gold cloth, right */}
      <path d="M200 8 C172 2 140 14 108 26 L108 48 C140 38 170 40 200 32 Z" fill="url(#gbGold)" />
      <path d="M200 14 C170 10 140 22 108 33" fill="none" stroke="#b98d2c" strokeWidth="0.8" opacity="0.45" />
      <path d="M200 24 C170 24 140 32 108 40" fill="none" stroke="#b98d2c" strokeWidth="0.8" opacity="0.35" />
      <path d="M200 29 C170 31 140 37 108 44" fill="none" stroke="#c8102e" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.7" />
      {dotsR.map(([x, y], i) => (
        <g key={'g' + i}>
          <circle cx={x} cy={y + 6} r="2.4" fill="#c8102e" />
          <circle cx={x} cy={y + 6} r="0.9" fill="#f7e2a0" />
        </g>
      ))}

      {/* the knot */}
      <ellipse cx="100" cy="38" rx="15" ry="14" fill="#b30f27" />
      <path d="M86 38 C88 26 112 26 114 38 C112 50 88 50 86 38 Z" fill="#c8102e" />
      <path d="M87 34 C96 28 106 28 113 34" fill="none" stroke="#f7e2a0" strokeWidth="3" strokeLinecap="round" />
      <path d="M87 42 C96 48 106 48 113 42" fill="none" stroke="#e3bf6a" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 25 C94 32 94 44 100 51" fill="none" stroke="#8c0c20" strokeWidth="1" opacity="0.55" />
      <path d="M92 31 C96 28 101 27 105 28" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      {/* tiny heart on the knot */}
      <path d="M100 44 C95 40 95 35 98 35 C99.5 35 100 36.5 100 36.5 C100 36.5 100.5 35 102 35 C105 35 105 40 100 44 Z" fill="#fff6f0" />
    </svg>
  );
}
