'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useCountdown } from '@/hooks/useCountdown';
import { Phone, MapPin } from 'lucide-react';

export default function HomePage() {
  const { days } = useCountdown();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F1ED]">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-[#3D3D3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Together with
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold text-[#8B7355] mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Tara & Bandana
          </motion.h2>

          <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-12 flex-wrap">
            <span className="text-lg text-[#3D3D3D] font-light">May 8, 2027</span>
            <span className="text-lg text-[#8B7355] font-light">•</span>
            <span className="text-lg text-[#3D3D3D] font-light">Kenwood, California</span>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-[#D4AF85] font-semibold mb-12"
          >
            {days} Days to Go!
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <motion.a
              href="#details"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(139, 115, 85, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#8B7355] text-white rounded-full font-semibold uppercase tracking-wide text-sm transition-all"
            >
              Learn More
            </motion.a>
            <motion.a
              href="/music"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(212, 175, 133, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-[#D4AF85] text-[#8B7355] rounded-full font-semibold uppercase tracking-wide text-sm transition-all"
            >
              Suggest Songs
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Info */}
      <section id="details" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {/* Date & Time */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Date & Time
            </h3>
            <p className="text-lg text-[#3D3D3D] mb-2">
              <span className="font-semibold">May 8, 2027</span>
            </p>
            <p className="text-[#8B7355]">Details coming soon</p>
          </motion.div>

          {/* Location */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4 flex items-center justify-center md:justify-start gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <MapPin className="w-6 h-6" />
              Location
            </h3>
            <p className="text-lg text-[#3D3D3D] mb-2">
              <span className="font-semibold">Kenwood, California</span>
            </p>
            <p className="text-[#8B7355]">Map and directions coming soon</p>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4 flex items-center justify-center md:justify-start gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <Phone className="w-6 h-6" />
              Contact
            </h3>
            <p className="text-lg text-[#3D3D3D]">
              <a href="tel:+14155551234" className="hover:text-[#D4AF85] transition-colors">
                +1 (415) 555-1234
              </a>
            </p>
          </motion.div>

          {/* Registry */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Registry
            </h3>
            <p className="text-[#3D3D3D] mb-4">Explore our registry on Amazon</p>
            <motion.a
              href="/registry"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-2 bg-[#D4AF85] text-white rounded-full font-semibold text-sm"
            >
              View Registry
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
