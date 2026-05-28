'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';

const navItems = [
  { label: 'Home', href: '/home' },
  { label: 'Our Story', href: '/story' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Registry', href: '/registry' },
  { label: 'Music', href: '/music' },
  { label: 'FAQs', href: '/faqs' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isMuted, hasStarted, toggle, hydrate } = useAudioStore();

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/home">
            <div
              className="text-xl md:text-2xl font-bold text-[#8B7355] cursor-pointer transition-transform hover:scale-105"
              style={{ fontFamily: "'Great Vibes','Playfair Display', serif" }}
            >
              T &nbsp;&nbsp;&&nbsp;&nbsp;B
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="text-[#3D3D3D] cursor-pointer font-medium text-sm uppercase tracking-wide transition-colors hover:text-[#D4AF85]">
                  {item.label}
                </span>
              </Link>
            ))}
            {/* Music toggle — only visible after music has started */}
            {hasStarted && (
              <button
                onClick={toggle}
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
                title={isMuted ? 'Unmute music' : 'Mute music'}
                className="text-[#8B7355] hover:text-[#D4AF85] transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {hasStarted && (
              <button
                onClick={toggle}
                aria-label={isMuted ? 'Unmute music' : 'Mute music'}
                className="text-[#8B7355]"
                style={{ touchAction: 'manipulation' }}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
            <button
              className=""
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              style={{ touchAction: 'manipulation' }}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-[#8B7355]" />
              ) : (
                <Menu className="w-6 h-6 text-[#8B7355]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
        >
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setIsOpen(false)}
                  className="text-[#3D3D3D] py-4 px-4 rounded-lg font-medium text-xl uppercase tracking-wide cursor-pointer text-center transition-colors hover:text-[#8B7355]"
                >
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
