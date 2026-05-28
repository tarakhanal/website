'use client';

import { useEffect } from 'react';

export default function HeartClickEffect() {
  useEffect(() => {
    // Throttle: no more than one burst every 300ms to avoid lag during scrolling
    let lastFire = 0;

    // For touch: track start position to skip scroll gestures
    let touchStartX = 0;
    let touchStartY = 0;

    const spawnHearts = (x: number, y: number) => {
      const now = Date.now();
      if (now - lastFire < 300) return;
      lastFire = now;

      const count = 3; // fixed count — fewer DOM nodes, less jank

      for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.textContent = '❤️';

        const size = Math.random() * 10 + 14; // 14–24px
        const angle = Math.random() * 60 - 30;
        const rise = Math.random() * 50 + 50; // 50–100px
        const duration = Math.random() * 400 + 700; // 700–1100ms

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
          const eased = 1 - Math.pow(1 - progress, 2);
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

        setTimeout(() => requestAnimationFrame(animate), i * 80);
      }
    };

    const handleClick = (e: MouseEvent) => {
      spawnHearts(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const dx = Math.abs(touch.clientX - touchStartX);
      const dy = Math.abs(touch.clientY - touchStartY);
      // Only count as a tap if finger barely moved (not a scroll)
      if (dx < 10 && dy < 10) {
        spawnHearts(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return null;
}
