'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

// TODO: replace with the real Zelle email or phone number
const zelle_email = process.env.NEXT_PUBLIC_ZELLE_HANDLE_EMAIL || '';
const ZELLE_HANDLE = zelle_email;

export default function RegistryPage() {
  const [copied, setCopied] = useState(false);
  const copyZelle = async () => {
    try {
      await navigator.clipboard.writeText(ZELLE_HANDLE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <main style={{ minHeight: '100svh', background: '#F7F3EE' }}>
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ paddingTop: 'clamp(7rem, 18vw, 11rem)', paddingBottom: 'clamp(3rem, 8vw, 5rem)', textAlign: 'center', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(3.5rem, 12vw, 7rem)',
            fontWeight: 700,
            color: '#3D3229',
            lineHeight: 1,
            marginBottom: '1.25rem',
          }}
        >
          Registry
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}
        >
          <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to right, transparent, #C9A96E)' }} />
          <span style={{ color: '#C9A96E', fontSize: '0.65rem', letterSpacing: '0.15em' }}>✦</span>
          <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to left, transparent, #C9A96E)' }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 'clamp(0.95rem, 3.2vw, 1.1rem)',
            color: '#7A6652',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.8,
          }}
        >
          Your presence is the greatest gift of all. If you&apos;d like to give something more, we&apos;ve created a registry with items we love.
        </motion.p>
      </section>

      {/* ── Registry Card ────────────────────────────────────── */}
      <section style={{ padding: '0 clamp(1rem, 5vw, 2rem) clamp(3rem, 8vw, 5rem)', maxWidth: '920px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'relative',
            background: '#FAF7F4',
            borderRadius: '1.5rem',
            border: '1px solid #E8E0D5',
            boxShadow: '0 8px 32px rgba(139,115,85,0.12)',
            overflow: 'hidden',
            padding: 'clamp(2rem, 7vw, 3rem) clamp(1.5rem, 6vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Gold top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #C9A96E, #8B7355, #C9A96E)' }} />

          {/* Icon */}
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFB347, #FF9900)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 12px rgba(255,153,0,0.2)',
          }}>
            🛍️
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.5rem, 4.5vw, 2rem)',
            fontWeight: 700,
            color: '#3D3229',
            marginBottom: '0.75rem',
          }}>
            Amazon Registry
          </h2>

          <p style={{
            fontFamily: "'Lora', serif",
            color: '#7A6652',
            fontSize: 'clamp(0.9rem, 2.8vw, 0.98rem)',
            lineHeight: 1.7,
            marginBottom: '1.75rem',
          }}>
            Curated items for our home
          </p>

          <a
            href="https://www.amazon.com/wedding/guest-view/7JBIJU9AX8H4"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 2rem',
              background: 'linear-gradient(135deg, #8B7355, #A8896C)',
              color: '#fff',
              borderRadius: '3rem',
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(0.9rem, 2.5vw, 0.95rem)',
              fontWeight: 600,
              letterSpacing: '0.02em',
              boxShadow: '0 4px 16px rgba(139,115,85,0.3)',
              textDecoration: 'none',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'transform 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
          >
            View Registry
            <ExternalLink style={{ width: '16px', height: '16px' }} />
          </a>
        </motion.div>

        {/* Zelle card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            position: 'relative',
            background: '#FAF7F4',
            borderRadius: '1.5rem',
            border: '1px solid #E8E0D5',
            boxShadow: '0 8px 32px rgba(139,115,85,0.12)',
            overflow: 'hidden',
            padding: 'clamp(2rem, 7vw, 3rem) clamp(1.5rem, 6vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #C9A96E, #8B7355, #C9A96E)' }} />

          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8F3DF0, #6D1ED4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.9rem', fontWeight: 700, color: '#fff',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 12px rgba(109,30,212,0.25)',
          }}>
            Z
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.5rem, 4.5vw, 2rem)',
            fontWeight: 700,
            color: '#3D3229',
            marginBottom: '0.75rem',
          }}>
            Zelle
          </h2>

          <p style={{
            fontFamily: "'Lora', serif",
            color: '#7A6652',
            fontSize: 'clamp(0.9rem, 2.8vw, 0.98rem)',
            lineHeight: 1.7,
            marginBottom: '1.25rem',
          }}>
            A gift toward our new life together
          </p>

          <div style={{
            fontFamily: "'Lora', serif",
            fontSize: '0.95rem',
            color: '#3D3229',
            background: '#fff',
            border: '1px dashed #C9A96E',
            borderRadius: '0.75rem',
            padding: '0.6rem 1rem',
            marginBottom: '1.25rem',
            wordBreak: 'break-all',
          }}>
            {ZELLE_HANDLE}
          </div>

          <button
            onClick={copyZelle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 2rem',
              background: 'linear-gradient(135deg, #8B7355, #A8896C)',
              color: '#fff',
              border: 'none',
              borderRadius: '3rem',
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(0.9rem, 2.5vw, 0.95rem)',
              fontWeight: 600,
              letterSpacing: '0.02em',
              boxShadow: '0 4px 16px rgba(139,115,85,0.3)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : 'Copy Zelle Info'}
            {copied ? <Check style={{ width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
          </button>
        </motion.div>
      </section>



      {/* ── Closing Quote ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4rem, 10vw, 6rem) 1.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to right, transparent, #C9A96E)' }} />
            <span style={{ color: '#C9A96E', fontSize: '0.65rem', letterSpacing: '0.15em' }}>✦</span>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to left, transparent, #C9A96E)' }} />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
