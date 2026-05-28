'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ScratchCardProps {
  label: string;       // e.g. "Month"
  revealText: string;  // e.g. "April"
  onScratched: () => void;
  disabled?: boolean;
}

const SCRATCH_THRESHOLD = 0.55; // 55% scratched triggers reveal

export default function ScratchCard({ label, revealText, onScratched, disabled }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const isDrawing = useRef(false);
  const hasTriggered = useRef(false);

  // Fill canvas with the scratch overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match its CSS size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 200;
    canvas.height = rect.height || 200;

    // Gold/taupe gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#c8a96e');
    gradient.addColorStop(0.5, '#d4b483');
    gradient.addColorStop(1, '#b89060');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Label on the scratch surface
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `bold ${Math.floor(canvas.width * 0.12)}px 'Playfair Display', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ Scratch ✦', canvas.width / 2, canvas.height / 2);

    // Subtle label text below
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `${Math.floor(canvas.width * 0.085)}px sans-serif`;
    ctx.fillText(label, canvas.width / 2, canvas.height / 2 + canvas.height * 0.18);
  }, [label]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch percentage
    if (!hasTriggered.current) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparent = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 128) transparent++;
      }
      const total = pixels.length / 4;
      if (transparent / total > SCRATCH_THRESHOLD) {
        hasTriggered.current = true;
        // Animate clear
        animateClear(canvas, ctx);
        setRevealed(true);
        onScratched();
      }
    }
  }, [onScratched]);

  const animateClear = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    let alpha = 1;
    const fade = () => {
      alpha -= 0.05;
      if (alpha <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (revealed || disabled) return;
    isDrawing.current = true;
    const pos = getPos(e, canvasRef.current!);
    scratch(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current || revealed || disabled) return;
    const pos = getPos(e, canvasRef.current!);
    scratch(pos.x, pos.y);
  };

  const handleMouseUp = () => { isDrawing.current = false; };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (revealed || disabled) return;
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e, canvasRef.current!);
    scratch(pos.x, pos.y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing.current || revealed || disabled) return;
    e.preventDefault();
    const pos = getPos(e, canvasRef.current!);
    scratch(pos.x, pos.y);
  };

  const handleTouchEnd = () => { isDrawing.current = false; };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Label */}
      <p
        className="text-sm uppercase tracking-widest text-[#8B7355] font-semibold"
        style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.2em' }}
      >
        {label}
      </p>

      {/* Card wrapper */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{ width: 'clamp(90px, 26vw, 160px)', height: 'clamp(90px, 26vw, 160px)' }}
      >
        {/* Reveal layer (underneath) */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #fdf6ee 0%, #f5ede0 100%)',
            border: '2px solid #d4b483',
          }}
        >
          <span
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: 'clamp(1.4rem, 5vw, 2.1rem)',
              color: '#8B7355',
              textAlign: 'center',
              lineHeight: 1.1,
              padding: '0 8px',
            }}
          >
            {revealText}
          </span>
        </div>

        {/* Scratch canvas on top */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-2xl"
          style={{ touchAction: 'none', cursor: revealed ? 'default' : 'crosshair' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
    </div>
  );
}
