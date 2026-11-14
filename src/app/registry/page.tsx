'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { ExternalLink } from 'lucide-react';

export default function RegistryPage() {

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
      <section style={{ padding: '0 clamp(1rem, 5vw, 2rem) clamp(3rem, 8vw, 5rem)', maxWidth: '600px', margin: '0 auto' }}>
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
          <p style={{
            fontFamily: "'Lora', serif",
            fontSize: 'clamp(1.05rem, 3.8vw, 1.35rem)',
            fontStyle: 'italic',
            color: '#8B7355',
            maxWidth: '520px',
            margin: '0 auto 1rem',
            lineHeight: 1.8,
          }}>
            &ldquo;Whether you bring a gift or simply bring yourself, you&apos;ve already given us the greatest joy.&rdquo;
          </p>
          <p style={{ fontFamily: "'Lora', serif", color: '#B0967E', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            — Bandana &amp; Tara
          </p>
        </motion.div>
      </section>
    </main>
  );
}
