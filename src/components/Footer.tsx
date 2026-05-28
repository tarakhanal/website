'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Our Story', href: '/story' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Registry', href: '/registry' },
  { label: 'Music', href: '/music' },
  { label: 'FAQs', href: '/faqs' },
];

export default function Footer() {
  return (
    <footer className="bg-[#3D3229] text-white/80 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-white/90 mb-4 leading-relaxed"
          style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2rem' }}
        >
          you&apos;re my favorite person to do anything with for the rest of my life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-16 h-px bg-white/30 mx-auto my-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-10"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/60 hover:text-white transition-colors text-sm uppercase tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-white/40 text-sm"
        >
          Tara &amp; Bandana · April 24, 2027
        </motion.p>
      </div>
    </footer>
  );
}
