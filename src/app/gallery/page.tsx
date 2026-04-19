'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useState } from 'react';
import { X } from 'lucide-react';

const placeholderPhotos = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Photo ${i + 1}`,
  description: 'Your wedding photo here',
}));

export default function GalleryPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
          {placeholderPhotos.map((photo) => (
            <motion.button
              key={photo.id}
              variants={itemVariants}
              onClick={() => setSelectedId(photo.id)}
              className="relative w-full aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Placeholder Image */}
              <div className="w-full h-full bg-gradient-to-br from-[#C1A78C] to-[#D4AF85] flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm font-light">{photo.title}</p>
                </div>
              </div>

              {/* Overlay on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="text-white text-center"
                >
                  <p className="text-lg font-semibold">View</p>
                </motion.div>
              </motion.div>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedId !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedId(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl"
              >
                {/* Image Container */}
                <motion.div
                  layoutId={`photo-${selectedId}`}
                  className="w-full aspect-square bg-gradient-to-br from-[#C1A78C] to-[#D4AF85] rounded-lg flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <p className="text-2xl font-light">Photo {selectedId}</p>
                    <p className="text-sm font-light">Your photo will appear here</p>
                  </div>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedId(null)}
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
                      setSelectedId(
                        selectedId === 1 ? placeholderPhotos.length : selectedId - 1
                      )
                    }
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                  >
                    ← Previous
                  </motion.button>

                  <span className="text-white font-light">
                    {selectedId} / {placeholderPhotos.length}
                  </span>

                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setSelectedId(
                        selectedId === placeholderPhotos.length ? 1 : selectedId + 1
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
