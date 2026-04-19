'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const personVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
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
            About Us
          </h1>
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto">
            Get to know us a little better
          </p>
        </motion.div>
      </section>

      {/* About Tara */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            {/* Image */}
            <motion.div
              variants={personVariants}
              className="order-2 md:order-1"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-[#C1A78C] to-[#D4AF85] rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white text-sm font-light">Photo: Tara</p>
                  <p className="text-white/80 text-xs">
                    (Placeholder - add your photo here)
                  </p>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              variants={itemVariants}
              className="order-1 md:order-2"
            >
              <h2
                className="text-4xl font-bold text-[#8B7355] mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Tara
              </h2>
              <div className="space-y-4 text-[#3D3D3D]">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tara
                  is a passionate individual with a love for [hobbies/interests].
                </p>
                <p>
                  She believes in [values] and finds joy in [activities]. When
                  not planning for the big day, Tara loves [hobbies].
                </p>
                <div className="pt-4 space-y-2">
                  <p>
                    <span className="font-semibold text-[#8B7355]">
                      Favorite Quote:{' '}
                    </span>
                    "Life is what happens when you're busy making other plans."
                  </p>
                  <p>
                    <span className="font-semibold text-[#8B7355]">
                      Hobbies:{' '}
                    </span>
                    Hiking, photography, cooking, reading
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* About Bandana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* About */}
            <motion.div variants={itemVariants}>
              <h2
                className="text-4xl font-bold text-[#8B7355] mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bandana
              </h2>
              <div className="space-y-4 text-[#3D3D3D]">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bandana
                  is a creative individual with a passion for [hobbies/interests].
                </p>
                <p>
                  He values [values] and finds purpose in [activities]. In his free
                  time, Bandana enjoys [hobbies].
                </p>
                <div className="pt-4 space-y-2">
                  <p>
                    <span className="font-semibold text-[#8B7355]">
                      Favorite Quote:{' '}
                    </span>
                    "The best adventures bring new perspectives."
                  </p>
                  <p>
                    <span className="font-semibold text-[#8B7355]">
                      Hobbies:{' '}
                    </span>
                    Travel, music, cooking, sports
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div variants={personVariants}>
              <div className="w-full aspect-square bg-gradient-to-br from-[#C1A78C] to-[#D4AF85] rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white text-sm font-light">Photo: Bandana</p>
                  <p className="text-white/80 text-xs">
                    (Placeholder - add your photo here)
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Fun Facts */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-[#8B7355] mb-12 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Fun Facts About Us
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Our Song',
                content:
                  'Add your song here and tell us why it\'s special to you both!',
              },
              {
                title: 'Favorite Travel Destination',
                content: 'Share the place that means the most to you as a couple',
              },
              {
                title: 'How We Take Our Coffee',
                content:
                  'Tara: [Coffee preference] | Bandana: [Coffee preference]',
              },
              {
                title: 'Our Love Language',
                content:
                  'Discovering and expressing love in ways that matter most',
              },
              {
                title: 'Our Biggest Adventure',
                content:
                  'Share a memorable adventure or trip you took together',
              },
              {
                title: 'Date Night Favorite',
                content: 'What do you both love doing together? Movies, cooking, hiking?',
              },
            ].map((fact, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-white rounded-lg shadow-md border-l-4 border-[#D4AF85]"
              >
                <h3 className="text-xl font-bold text-[#8B7355] mb-2">
                  {fact.title}
                </h3>
                <p className="text-[#3D3D3D] text-sm">{fact.content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
