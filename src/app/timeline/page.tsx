'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Clock } from 'lucide-react';

const timelineEvents = [
  {
    time: '3:00 PM',
    title: 'Ceremony',
    description: 'Join us as we say "I do"',
    location: 'Main Garden',
  },
  {
    time: '4:00 PM',
    title: 'Cocktail Hour',
    description: 'Relax, mingle, and enjoy refreshments',
    location: 'Patio Area',
  },
  {
    time: '5:00 PM',
    title: 'Dinner',
    description: 'Enjoy a delicious 3-course meal',
    location: 'Reception Hall',
  },
  {
    time: '6:00 PM',
    title: 'Speeches & Toasts',
    description: 'Heartfelt words from those closest to us',
    location: 'Reception Hall',
  },
  {
    time: '6:30 PM',
    title: 'First Dance',
    description: 'Our first dance as husband and wife',
    location: 'Reception Hall',
  },
  {
    time: '7:00 PM',
    title: 'Dance & Reception',
    description: 'Music, dancing, and celebration!',
    location: 'Reception Hall',
  },
  {
    time: '10:00 PM',
    title: 'Farewell',
    description: 'See you next time!',
    location: 'Main Exit',
  },
];

export default function TimelinePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
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
            Wedding Day Timeline
          </h1>
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto">
            May 8, 2027 • Kenwood, California
          </p>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Timeline Line */}
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#D4AF85] to-[#8B7355]" />

            {/* Timeline Events */}
            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`flex md:gap-0 gap-6 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} w-full`}>
                    <motion.div
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(139, 115, 85, 0.2)' }}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <div className="flex md:justify-end md:mb-0 mb-3 items-center gap-2">
                        <Clock className="w-5 h-5 text-[#D4AF85]" />
                        <p className="text-lg font-bold text-[#8B7355]">{event.time}</p>
                      </div>
                      <h3
                        className="text-2xl font-bold text-[#8B7355] mb-2"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {event.title}
                      </h3>
                      <p className="text-[#3D3D3D] mb-2">{event.description}</p>
                      <p className="text-sm text-[#8B7355] font-semibold">
                        📍 {event.location}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <div className="md:w-0 hidden md:flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.3 }}
                      className="w-5 h-5 bg-[#D4AF85] rounded-full border-4 border-white shadow-md"
                    />
                  </div>

                  {/* Spacer */}
                  <div className="md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Note Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#8B7355]/10">
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
            Important Notes
          </h2>
          <ul className="text-[#3D3D3D] space-y-3 text-left">
            <li className="flex items-start gap-3">
              <span className="text-[#D4AF85] font-bold mt-1">•</span>
              <span>Please arrive 15 minutes early to the ceremony</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D4AF85] font-bold mt-1">•</span>
              <span>Parking information will be provided upon arrival</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D4AF85] font-bold mt-1">•</span>
              <span>Please silence your phones during the ceremony</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#D4AF85] font-bold mt-1">•</span>
              <span>Join us in suggesting songs for the reception!</span>
            </li>
          </ul>
        </motion.div>
      </section>
    </main>
  );
}
