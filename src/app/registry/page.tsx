'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { ExternalLink } from 'lucide-react';

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const registryItems = [
  { emoji: '🍳', label: 'Kitchen & cookware' },
  { emoji: '🛋️', label: 'Home décor & furnishings' },
  { emoji: '🛏️', label: 'Bedding & bath essentials' },
  { emoji: '🌿', label: 'Outdoor & garden' },
  { emoji: '✈️', label: 'Travel & experiences' },
];

export default function RegistryPage() {
  return (
    <main style={{ minHeight: '100svh', background: '#F7F3EE' }}>
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ paddingTop: 'clamp(7rem, 18vw, 11rem)', paddingBottom: '2rem', textAlign: 'center', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(4rem, 14vw, 9rem)',
            fontWeight: 700,
            color: '#3D3229',
            lineHeight: 1,
            marginBottom: '1.5rem',
          }}
        >
          registry
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}
        >
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, #C9A96E)' }} />
          <span style={{ color: '#C9A96E', fontSize: '0.65rem', letterSpacing: '0.15em' }}>✦</span>
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, #C9A96E)' }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 'clamp(1rem, 3.5vw, 1.15rem)',
            color: '#7A6652',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.8,
          }}
        >
          Your presence at our celebration is the greatest gift of all.
          But if you&apos;d like to bless us with something more, we&apos;re grateful.
        </motion.p>
      </section>

      {/* ── Registry Card ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(2rem, 6vw, 4rem) clamp(1rem, 5vw, 2rem)', maxWidth: '680px', margin: '0 auto' }}>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            position: 'relative',
            background: '#FAF7F4',
            borderRadius: '1.75rem',
            border: '1px solid #E8E0D5',
            boxShadow: '0 12px 48px rgba(139,115,85,0.13)',
            overflow: 'hidden',
            padding: 'clamp(2rem, 7vw, 3.5rem) clamp(1.5rem, 6vw, 3rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Gold top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #C9A96E, #8B7355, #C9A96E)' }} />

          {/* Icon */}
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF9900, #FFB347)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 16px rgba(255,153,0,0.25)',
          }}>
            🛍️
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
            fontWeight: 700,
            color: '#3D3229',
            marginBottom: '0.5rem',
          }}>
            Amazon Registry
          </h2>

          <p style={{
            fontFamily: "'Lora', serif",
            color: '#7A6652',
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            lineHeight: 1.75,
            maxWidth: '400px',
            marginBottom: '2rem',
          }}>
            Browse our curated selection — from kitchen essentials to cozy home finds — all in one place.
          </p>

          <a
            href="https://www.amazon.com/wedding/guest-view/7JBIJU9AX8H4"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.9rem 2.25rem',
              background: 'linear-gradient(135deg, #8B7355, #A8896C)',
              color: '#fff',
              borderRadius: '3rem',
              fontFamily: "'Lora', serif",
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              boxShadow: '0 4px 20px rgba(139,115,85,0.35)',
              textDecoration: 'none',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            View Our Registry
            <ExternalLink style={{ width: '15px', height: '15px' }} />
          </a>
        </motion.div>
      </section>

      {/* ── What We're Registered For ─────────────────────────── */}
      <section style={{ padding: '0 clamp(1rem, 5vw, 2rem) clamp(2rem, 6vw, 3rem)', maxWidth: '680px', margin: '0 auto' }}>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            background: '#FAF7F4',
            borderRadius: '1.5rem',
            border: '1px solid #E8E0D5',
            boxShadow: '0 4px 24px rgba(139,115,85,0.08)',
            padding: 'clamp(1.75rem, 6vw, 2.75rem) clamp(1.5rem, 6vw, 2.5rem)',
          }}
        >
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontWeight: 700,
            color: '#3D3229',
            marginBottom: '0.5rem',
          }}>
            What we&apos;re registered for
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ height: '1px', flex: 1, background: '#E8E0D5' }} />
            <span style={{ color: '#C9A96E', fontSize: '0.55rem', letterSpacing: '0.1em' }}>✦</span>
            <div style={{ height: '1px', flex: 1, background: '#E8E0D5' }} />
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {registryItems.map((item) => (
              <li key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{
                  width: '38px', height: '38px', flexShrink: 0,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F5EFE6, #EDE0CF)',
                  border: '1px solid #D4C4B0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                }}>
                  {item.emoji}
                </span>
                <span style={{ fontFamily: "'Lora', serif", color: '#5C4A38', fontSize: 'clamp(0.88rem, 3vw, 0.98rem)' }}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ padding: '0 clamp(1rem, 5vw, 2rem) clamp(2rem, 6vw, 3rem)', maxWidth: '680px', margin: '0 auto' }}>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            background: '#FAF7F4',
            borderRadius: '1.5rem',
            border: '1px solid #E8E0D5',
            boxShadow: '0 4px 24px rgba(139,115,85,0.08)',
            padding: 'clamp(1.75rem, 6vw, 2.75rem) clamp(1.5rem, 6vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
              fontWeight: 700,
              color: '#3D3229',
              marginBottom: '0.5rem',
            }}>
              A few kind notes
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ height: '1px', flex: 1, background: '#E8E0D5' }} />
              <span style={{ color: '#C9A96E', fontSize: '0.55rem', letterSpacing: '0.1em' }}>✦</span>
              <div style={{ height: '1px', flex: 1, background: '#E8E0D5' }} />
            </div>
          </div>

          {[
            {
              q: 'Is a gift required?',
              a: 'Not at all. Your presence, love, and celebration with us is more than enough.',
            },
            {
              q: 'Can I give cash or contribute to our honeymoon?',
              a: 'Absolutely — a heartfelt card or contribution toward our honeymoon is always cherished.',
            },
            {
              q: 'When should I send a gift?',
              a: 'Anytime before or after the wedding is perfectly lovely. No rush at all.',
            },
          ].map((faq) => (
            <div key={faq.q} style={{ borderTop: '1px solid #EDE0CF', paddingTop: '1.25rem' }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: '#5C4A38',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                marginBottom: '0.4rem',
              }}>
                {faq.q}
              </p>
              <p style={{
                fontFamily: "'Lora', serif",
                color: '#7A6652',
                fontSize: 'clamp(0.85rem, 2.8vw, 0.95rem)',
                lineHeight: 1.75,
              }}>
                {faq.a}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Closing Quote ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 1.5rem clamp(4rem, 10vw, 6rem)', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, #C9A96E)' }} />
            <span style={{ color: '#C9A96E', fontSize: '0.65rem', letterSpacing: '0.15em' }}>✦</span>
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, #C9A96E)' }} />
          </div>
          <p style={{
            fontFamily: "'Lora', serif",
            fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
            fontStyle: 'italic',
            color: '#8B7355',
            maxWidth: '520px',
            margin: '0 auto 1rem',
            lineHeight: 1.75,
          }}>
            &ldquo;Whether you bring a gift or simply bring yourself, you&apos;ve already given us the greatest joy.&rdquo;
          </p>
          <p style={{ fontFamily: "'Lora', serif", color: '#B0967E', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            — Tara &amp; Bandana
          </p>
        </motion.div>
      </section>
    </main>
  );
}
