'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/home' },
  { label: 'Story', href: '/story' },
  { label: 'About Us', href: '/about' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Registry', href: '/registry' },
  { label: 'Music', href: '/music' },
  { label: 'FAQs', href: '/faqs' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl md:text-2xl font-bold text-[#8B7355] cursor-pointer"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              T & B
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.span
                  whileHover={{ color: '#D4AF85' }}
                  className="text-[#3D3D3D] cursor-pointer font-medium text-sm uppercase tracking-wide"
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-[#8B7355]" />
            ) : (
              <Menu className="w-6 h-6 text-[#8B7355]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  onClick={() => setIsOpen(false)}
                  whileHover={{ backgroundColor: 'rgba(212, 175, 133, 0.15)' }}
                  whileTap={{ backgroundColor: 'rgba(212, 175, 133, 0.25)' }}
                  className="text-[#3D3D3D] py-4 px-4 rounded-lg font-medium text-xl uppercase tracking-wide cursor-pointer text-center transition-colors hover:text-[#8B7355]"
                >
                  {item.label}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
