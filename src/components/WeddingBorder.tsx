import React from 'react';

// Nepali wedding-theme border: deep red frame with gold line, marigold (sayapatri) garlands down
// both sides, hanging string lights across the top and a small kalash in each bottom corner.
// Everything is sized from `scale`, so the opened page (scale 1) and the mini flying preview
// card (smaller scale) look identical.
export default function WeddingBorder({ scale = 1 }: { scale?: number }) {
  const s = scale;
  const frame = 9 * s;
  const gar = 20 * s;
  const tile = 17 * s;
  const lightsH = 46 * s;
  const lightsTile = 60 * s;
  const kal = 34 * s;

  const garland = (side: 'left' | 'right') => (
    <svg
      width={gar}
      height="100%"
      style={{ position: 'absolute', top: frame, bottom: frame, [side]: frame + 1.5 * s, height: `calc(100% - ${2 * frame}px)` }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={`mari-${side}`} width={gar} height={tile} patternUnits="userSpaceOnUse">
          <line x1={gar / 2} y1="0" x2={gar / 2} y2={tile} stroke="#2f7d32" strokeWidth={1.2 * s} />
          <circle cx={gar / 2} cy={tile / 2} r={8.2 * s} fill="#f08a10" />
          <circle cx={gar / 2} cy={tile / 2} r={6 * s} fill="#ffb21f" />
          <circle cx={gar / 2} cy={tile / 2} r={3.2 * s} fill="#f7d046" />
          <circle cx={gar / 2} cy={tile / 2} r={1.2 * s} fill="#d46a00" />
        </pattern>
      </defs>
      <rect width={gar} height="100%" fill={`url(#mari-${side})`} />
    </svg>
  );

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {/* red frame + gold inner line */}
      <div
        className="absolute inset-0"
        style={{
          border: `${frame}px solid #a8132a`,
          boxShadow: `inset 0 0 0 ${1.5 * s}px #e8c56e, inset 0 0 ${14 * s}px rgba(90,10,20,0.35)`,
        }}
      />

      {garland('left')}
      {garland('right')}

      {/* string lights */}
      <svg
        width="100%"
        height={lightsH}
        style={{ position: 'absolute', top: frame, left: frame, width: `calc(100% - ${2 * frame}px)` }}
      >
        <defs>
          <radialGradient id="bulbGlow">
            <stop offset="0" stopColor="#fff6c8" stopOpacity="1" />
            <stop offset="0.45" stopColor="#ffd45a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffb300" stopOpacity="0" />
          </radialGradient>
          <pattern id="lights" width={lightsTile} height={lightsH} patternUnits="userSpaceOnUse">
            {[
              [0.12, 0.34],
              [0.37, 0.7],
              [0.62, 0.46],
              [0.86, 0.82],
            ].map(([x, h], i) => (
              <g key={i}>
                <line x1={lightsTile * x} y1="0" x2={lightsTile * x} y2={lightsH * h} stroke="#e8c56e" strokeWidth={0.9 * s} />
                <circle cx={lightsTile * x} cy={lightsH * h} r={6.5 * s} fill="url(#bulbGlow)" />
                <circle cx={lightsTile * x} cy={lightsH * h} r={2.2 * s} fill="#fff3b0" />
              </g>
            ))}
          </pattern>
        </defs>
        <line x1="0" y1={1 * s} x2="100%" y2={1 * s} stroke="#e8c56e" strokeWidth={1.2 * s} />
        <rect width="100%" height={lightsH} fill="url(#lights)" />
      </svg>

      {/* kalash (sacred pot with mango leaves + coconut), bottom corners */}
      {(['left', 'right'] as const).map((side) => (
        <svg
          key={side}
          width={kal}
          height={kal * 1.1}
          viewBox="0 0 40 44"
          style={{ position: 'absolute', bottom: frame + 2 * s, [side]: frame + gar + 3 * s }}
        >
          <path d="M20 14 C12 6 8 2 5 3 C8 8 13 12 19 15 Z" fill="#2f7d32" />
          <path d="M20 14 C28 6 32 2 35 3 C32 8 27 12 21 15 Z" fill="#3b9a3f" />
          <path d="M20 13 C18 7 19 3 20 1 C21 3 22 7 20 13 Z" fill="#2f7d32" />
          <ellipse cx="20" cy="15" rx="6" ry="5.2" fill="#8a5a2b" />
          <ellipse cx="18.3" cy="13.6" rx="1.6" ry="1" fill="#b98550" />
          <path d="M11 18 L29 18 L27 21 L13 21 Z" fill="#d1892b" />
          <path d="M13 21 C6 25 6 36 12 40 L28 40 C34 36 34 25 27 21 Z" fill="#c8741f" />
          <path d="M13 21 C8 26 8 34 12 38" fill="none" stroke="#f0a850" strokeWidth="1.6" opacity="0.7" />
          <path d="M12 28 L28 28" stroke="#a8132a" strokeWidth="2" />
          <path d="M12 33 L28 33" stroke="#e8c56e" strokeWidth="1.4" />
          <circle cx="20" cy="30.5" r="1.6" fill="#a8132a" />
        </svg>
      ))}
    </div>
  );
}
