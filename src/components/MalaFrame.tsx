import React from 'react';
import MirrorFrame from '@/components/MirrorFrame';

// Nepali mala (marigold garland) draped around the arched mirror: up one side, over the arch,
// down the other side, ending in two tassels. Wraps MirrorFrame + the photo.
// The garland is drawn in a fixed viewBox that scales with the card width, so the opened page and
// the mini flying preview card look identical. `scale` only sizes the mirror's gold border.
const VB_W = 300;
const VB_H = 390;
const L = 11, R = 289, T = 14, B = 342; // garland centerline box
const RX = 117, RY = 58;                 // arch corner radii (matches MirrorFrame's 42% / 16%)

function buildPath(): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const push = (x: number, y: number) => pts.push({ x, y });
  for (let y = B; y >= T + RY; y -= 1) push(L, y);                                   // left side up
  for (let a = 0; a <= 90; a += 1.5) {                                               // left arch
    const r = (a * Math.PI) / 180;
    push(L + RX - RX * Math.cos(r), T + RY - RY * Math.sin(r));
  }
  for (let x = L + RX; x <= R - RX; x += 1) push(x, T);                              // top
  for (let a = 0; a <= 90; a += 1.5) {                                               // right arch
    const r = (a * Math.PI) / 180;
    push(R - RX + RX * Math.sin(r), T + RY - RY * Math.cos(r));
  }
  for (let y = T + RY; y <= B; y += 1) push(R, y);                                   // right side down
  return pts;
}

function evenlySpaced(pts: { x: number; y: number }[], gap: number) {
  const out: { x: number; y: number; ang: number }[] = [];
  let acc = 0;
  let next = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    acc += Math.hypot(dx, dy);
    if (acc >= next) {
      out.push({ x: pts[i].x, y: pts[i].y, ang: (Math.atan2(dy, dx) * 180) / Math.PI });
      next += gap;
    }
  }
  return out;
}

const PATH = buildPath();
const BEADS = evenlySpaced(PATH, 11.5);
const THREAD = PATH.filter((_, i) => i % 4 === 0).map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
const PALETTE = ['#f28c0f', '#ffb81c', '#f5a312', '#ffc933'];

function Tassel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${B})`}>
      <line x1="0" y1="0" x2="0" y2="14" stroke="#b8860b" strokeWidth="1.2" />
      <circle cx="0" cy="17" r="5.2" fill="#c8102e" />
      <circle cx="0" cy="17" r="2.4" fill="#ffd45a" />
      {[-4, -2, 0, 2, 4].map((dx) => (
        <line key={dx} x1={dx * 0.6} y1="21" x2={dx * 1.5} y2="38" stroke="#e8c56e" strokeWidth="1.1" strokeLinecap="round" />
      ))}
      <circle cx="0" cy="22" r="2.2" fill="#f28c0f" />
    </g>
  );
}

export default function MalaFrame({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div style={{ position: 'relative', width: '100%', padding: '7% 6% 7% 6%' }}>
      <MirrorFrame scale={scale}>{children}</MirrorFrame>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', filter: 'drop-shadow(0 1.5px 1.5px rgba(70,30,0,0.3))' }}
        aria-hidden="true"
      >
        <defs>
          <g id="malaMari">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 4.4} cy={Math.sin((a * Math.PI) / 180) * 4.4} r="3.4" />
            ))}
            <circle r="4.2" fill="#ffd45a" opacity="0.9" />
            <circle r="1.6" fill="#c25a00" opacity="0.8" />
          </g>
          <g id="malaLeaf">
            <path d="M0 0 C3 -3 8 -3 11 0 C8 3 3 3 0 0 Z" fill="#2f7d32" />
            <path d="M1 0 L9 0" stroke="#1d5a21" strokeWidth="0.6" />
          </g>
        </defs>

        <path d={THREAD} fill="none" stroke="#a87408" strokeWidth="1.4" strokeLinejoin="round" />

        {BEADS.map((p, i) => i % 3 === 1 && (
          <g key={'l' + i} transform={`translate(${p.x} ${p.y}) rotate(${p.ang + 90})`}>
            <use href="#malaLeaf" transform="translate(0 -3) rotate(-35)" />
            <use href="#malaLeaf" transform="translate(0 3) rotate(215) scale(1 -1)" />
          </g>
        ))}

        {BEADS.map((p, i) => {
          const red = i % 7 === 3;
          return red ? (
            <g key={'f' + i} transform={`translate(${p.x} ${p.y})`}>
              <circle r="6" fill="#c8102e" />
              <circle r="4" fill="#e23a52" />
              <circle r="2" fill="#ffd45a" />
            </g>
          ) : (
            <g key={'f' + i} transform={`translate(${p.x} ${p.y}) rotate(${(i * 37) % 360})`} fill={PALETTE[i % PALETTE.length]}>
              <use href="#malaMari" />
            </g>
          );
        })}

        {/* crown flower at the top of the arch */}
        <g transform={`translate(${(L + R) / 2} ${T})`}>
          <circle r="11" fill="#c8102e" />
          <circle r="8" fill="#e23a52" />
          <circle r="5" fill="#ffd45a" />
          <circle r="2.2" fill="#c25a00" />
        </g>

        <Tassel x={L} />
        <Tassel x={R} />
      </svg>
    </div>
  );
}
