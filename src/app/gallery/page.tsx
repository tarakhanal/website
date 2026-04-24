 'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

import img1 from '@/app/images/04446EEE-0136-418E-8902-62C240512589_1_105_c.jpeg';
import img2 from '@/app/images/2541030F-6D6B-4371-A4BA-3C32119F9069_1_105_c.jpeg';
import img3 from '@/app/images/2A9431D3-9F4F-437A-B5C6-E17595A55B57_1_105_c.jpeg';
import img4 from '@/app/images/38D3FC1B-AD16-4FDF-9F54-BB48A4A29A56_1_105_c.jpeg';
import img5 from '@/app/images/3BBD37D8-1EDA-4B45-A8DA-26F5C2B40DEA_1_105_c.jpeg';
import img6 from '@/app/images/41C52320-34D7-49B6-95B3-B4D49271D9B7_1_105_c.jpeg';
import img7 from '@/app/images/7CD00EBC-D6FC-44D1-B8CF-21BD319CEE49_1_105_c.jpeg';
import img8 from '@/app/images/9B540E62-DA4C-4F60-93CE-C4784369E726_1_105_c.jpeg';
import img9 from '@/app/images/EEC2C875-CEA2-47C8-940C-D56522D07FE8_1_105_c.jpeg';
import img10 from '@/app/images/95FA751A-7DC3-497B-9912-C832408865D8_1_105_c.jpeg';
import img11 from '@/app/images/AB20A646-3F68-4945-9E85-3BE4932307FC_1_105_c.jpeg';
import img12 from '@/app/images/B48CEB98-E69A-4C1E-9798-CFE315E7D9A5_1_105_c.jpeg';

const galleryPhotos = [
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
  img12,
];

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F1ED]">
      <Navigation />

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-5xl md:text-6xl font-bold text-[#3D3D3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Gallery
          </h1>
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto">
            Moments from our journey together
          </p>
        </motion.div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {galleryPhotos.map((src, i) => (
            <motion.button
              key={i}
              variants={itemVariants}
              onClick={() => setSelectedIndex(i)}
              className="relative w-full aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Image
                src={src}
                alt={`Gallery photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover w-full h-full"
              />

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="text-white text-center">
                  <p className="text-lg font-semibold">View</p>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedIndex(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl"
              >
                {/* Image Container */}
                <motion.div
                  layoutId={`photo-${selectedIndex}`}
                  className="w-full rounded-lg overflow-hidden"
                >
                  <Image
                    src={galleryPhotos[selectedIndex ?? 0]}
                    alt={`Photo ${selectedIndex !== null ? selectedIndex + 1 : ''}`}
                    width={1200}
                    height={900}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </motion.div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedIndex(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                  aria-label="Close gallery"
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <motion.button
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setSelectedIndex((prev) =>
                        prev === 0 ? galleryPhotos.length - 1 : (prev ?? 0) - 1
                      )
                    }
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                  >
                    ← Previous
                  </motion.button>

                  <span className="text-white font-light">
                    {selectedIndex !== null ? selectedIndex + 1 : 0} / {galleryPhotos.length}
                  </span>

                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setSelectedIndex((prev) =>
                        prev === galleryPhotos.length - 1 ? 0 : (prev ?? 0) + 1
                      )
                    }
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                  >
                    Next →
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Info Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#8B7355]/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2
            className="text-2xl font-bold text-[#8B7355] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Help Us Capture More Moments!
          </h2>
          <p className="text-[#3D3D3D] mb-4">
            We'll be sharing photos from our wedding day here. Feel free to tag us
            and use our wedding hashtag to be featured!
          </p>
          <p className="text-lg font-semibold text-[#8B7355]">#TaraAndBandana2027</p>
        </motion.div>
      </section>
    </main>
  );
}
