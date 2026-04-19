'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const storyChapters = [
  {
    title: 'How We Met',
    date: 'Summer 2018',
    description:
      'It was a beautiful summer evening when our paths crossed. We were both at a mutual friend\'s dinner party, and something magical happened from the very first conversation. What started as a simple chat turned into hours of non-stop talking, discovering shared dreams, values, and an unexpected connection that felt like home.',
    image: '/placeholder-meet.jpg',
  },
  {
    title: 'First Date',
    date: 'June 2018',
    description:
      'Our first official date was at a cozy café overlooking the city. We talked about everything—from childhood memories to dreams for the future. We realized that we weren\'t just attracted to each other; we genuinely loved being in each other\'s presence. It felt effortless, natural, and absolutely right.',
    image: '/placeholder-date.jpg',
  },
  {
    title: 'Growing Together',
    date: '2018 - 2026',
    description:
      'Throughout the years, we\'ve grown, laughed, cried, and built a life together. We\'ve supported each other through challenges, celebrated victories, and created countless beautiful memories. Every moment has been a journey of discovering deeper layers of love and commitment.',
    image: '/placeholder-together.jpg',
  },
  {
    title: 'The Proposal',
    date: 'March 2026',
    description:
      'On a starlit night surrounded by fairy lights and rose petals, he got down on one knee and asked me to be his forever. With tears of joy and a resounding "YES!", we began the most exciting chapter of our love story—the journey toward forever.',
    image: '/placeholder-proposal.jpg',
  },
];

export default function StoryPage() {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);

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

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.4 },
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
            Our Story
          </h1>
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto">
            A journey of love, laughter, and forever
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
          className="max-w-3xl mx-auto"
        >
          {storyChapters.map((chapter, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="mb-6 last:mb-0"
            >
              <motion.button
                onClick={() =>
                  setExpandedChapter(expandedChapter === index ? null : index)
                }
                className="w-full text-left"
                whileHover={{ x: 5 }}
              >
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#D4AF85]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="text-2xl font-bold text-[#8B7355] mb-1"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {chapter.title}
                      </h3>
                      <p className="text-[#8B7355] font-light text-sm">
                        {chapter.date}
                      </p>
                    </div>
                    <motion.div
                      animate={{
                        rotate: expandedChapter === index ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6 text-[#D4AF85]" />
                    </motion.div>
                  </div>
                </div>
              </motion.button>

              <motion.div
                variants={expandVariants}
                animate={
                  expandedChapter === index ? 'expanded' : 'collapsed'
                }
                initial="collapsed"
                className="overflow-hidden"
              >
                <div className="p-6 bg-[#F5F1ED]/50 border-l-4 border-[#D4AF85] border-t-0 rounded-b-lg">
                  <p className="text-[#3D3D3D] leading-relaxed mb-4">
                    {chapter.description}
                  </p>
                  <div className="w-full h-48 bg-gradient-to-br from-[#C1A78C] to-[#D4AF85] rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white text-sm font-light">
                        Photo: {chapter.title}
                      </p>
                      <p className="text-white/80 text-xs">
                        (Placeholder - add your photos here)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#8B7355] text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p
            className="text-3xl md:text-4xl font-light mb-4 italic"
            style={{ fontFamily: "'Lora', serif" }}
          >
            "Love is not just something we feel, it's something we do."
          </p>
          <p className="text-lg font-light">— And we can't wait to do it with all of you</p>
        </motion.div>
      </section>
    </main>
  );
}
