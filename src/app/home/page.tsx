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

      {/* Spacer for fixed navbar */}
      <div className="h-24" />

      {/* Floating Image Marquee */}
      <section className="relative overflow-hidden py-6 bg-gradient-to-r from-[#F5F1ED] via-white/60 to-[#F5F1ED]">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' } }}
        >
          {[...Array(2)].flatMap((_, setIndex) =>
            [
              { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=280&fit=crop', alt: 'Wedding flowers' },
              { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=280&fit=crop', alt: 'Wedding rings' },
              { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=280&fit=crop', alt: 'Vineyard' },
              { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop', alt: 'Couple portrait' },
              { src: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&h=280&fit=crop', alt: 'Wine country' },
              { src: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&h=280&fit=crop', alt: 'Wedding decor' },
            ].map((img, i) => (
              <div
                key={`${setIndex}-${i}`}
                className="flex-shrink-0 w-[280px] h-[190px] rounded-2xl overflow-hidden shadow-lg"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            ))
          )}
        </motion.div>
      </section>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
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
