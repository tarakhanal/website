import React from 'react';

// Ornate arched gold "aaina" mirror frame with a glass shine, wraps the photo.
// `scale` shrinks the frame for the mini flying preview so both stay identical.
export default function MirrorFrame({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  const b = 6 * scale;
  return (
    <div
      className="relative w-full"
      style={{
        padding: b,
        borderRadius: '42% 42% 4px 4px / 16% 16% 4px 4px',
        background: 'linear-gradient(135deg, #f7e2a0 0%, #c9a24a 28%, #f3d68a 50%, #a97f2c 75%, #e8c56e 100%)',
        boxShadow: `0 ${2 * scale}px ${6 * scale}px rgba(90,60,10,0.35), inset 0 0 0 ${1 * scale}px rgba(255,255,255,0.45)`,
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: '40% 40% 2px 2px / 15% 15% 2px 2px',
          boxShadow: `inset 0 0 0 ${1 * scale}px rgba(90,60,10,0.5)`,
        }}
      >
        {children}
        {/* glass shine */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0) 50%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.18) 66%, rgba(255,255,255,0) 72%)' }}
        />
      </div>
      {/* tiny gold finial at the top of the arch */}
      <div
        className="absolute pointer-events-none"
        style={{ top: -3 * scale, left: '50%', width: 7 * scale, height: 7 * scale, transform: 'translateX(-50%) rotate(45deg)', background: 'linear-gradient(135deg,#f7e2a0,#b98d2c)', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      />
    </div>
  );
}
