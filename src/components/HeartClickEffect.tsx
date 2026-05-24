'use client';

import { useEffect } from 'react';

export default function HeartClickEffect() {
  useEffect(() => {
    const hearts = ['❤️'];

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const count = Math.floor(Math.random() * 3) + 3; // 3–5 hearts per click

      for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        const size = Math.random() * 14 + 14; // 14–28px
        const angle = Math.random() * 60 - 30; // -30° to +30° horizontal drift
        const rise = Math.random() * 60 + 60; // 60–120px upward travel
        const duration = Math.random() * 600 + 700; // 700–1300ms

        Object.assign(heart.style, {
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          fontSize: `${size}px`,
          lineHeight: '1',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: '99999',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
          animation: 'none',
        });

        document.body.appendChild(heart);

        const startTime = performance.now();

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const eased = 1 - Math.pow(1 - progress, 2); // ease-out quad
          const translateX = Math.sin((angle * Math.PI) / 180) * rise * eased;
          const translateY = -rise * eased;
          const opacity = progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4;
          const scale = 0.5 + eased * 0.7;

          heart.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`;
          heart.style.opacity = `${opacity}`;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            heart.remove();
          }
        };

        // Stagger each heart slightly
        setTimeout(() => requestAnimationFrame(animate), i * 60);
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick, { passive: true });

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, []);

  return null;
}
