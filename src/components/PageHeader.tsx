'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Optional small element above the title (e.g. a pill). */
  eyebrow?: ReactNode;
  /** Optional content below the subtitle (e.g. stats). */
  children?: ReactNode;
}

// Shared page header: consistent spacing under the fixed nav, title, ornament and subtitle.
export default function PageHeader({ title, subtitle, eyebrow, children }: PageHeaderProps) {
  return (
    <section className="page-hero">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl"
      >
        {eyebrow && <div className="mb-5 flex justify-center">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        <div className="page-ornament" aria-hidden="true">✦</div>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {children && <div className="mt-7">{children}</div>}
      </motion.div>
    </section>
  );
}
