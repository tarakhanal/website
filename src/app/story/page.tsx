'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import photo1 from '@/app/images/holding-hands.jpg';
import photo2 from '@/app/images/9B540E62-DA4C-4F60-93CE-C4784369E726_1_105_c.jpeg';

export default function StoryPage() {
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
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto"
             style={{ fontFamily: "'Lora', serif", marginTop: '5rem' }}>
            A journey of love, laughter, and forever growth
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-12">

          {/* First photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden shadow-lg"
          >
            <Image
              src={photo1}
              alt="Tara and Bandana"
              width={666.667}
              height={500}
              className="w-full object-cover"
            />
          </motion.div>

          {/* Story paragraphs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-[#3D3D3D] text-lg leading-relaxed text-center"
            style={{ fontFamily: "'Lora', serif", marginTop: '2rem', marginBottom: '2rem' }}
          >
            <p>
              It all started with a simple message on August 27, 2019. As Tara couldn&apos;t resist
              seeing a green shiny dot on Facebook Messenger, he reached out, and from that day on,
              the conversation never really stopped. What began as texts quickly turned into
              something more — long talks, shared laughs, and a connection that kept growing
              stronger every day.
            </p>
            <p>
              On October 19, we met in person for the first time. That day marked the beginning
              of our journey together — one filled with love, laughter, and countless memories
              made all throughout the places we have traveled to.
            </p>
            <p>
              Now, here we are in 2026, still side by side, stronger than ever. What started with
              a single message has grown into a lifelong commitment. We&apos;re so excited to take
              the next step and begin our forever. Our story has just begun, and we cannot wait to
              cherish all the moments that are yet to come.
            </p>
          </motion.div>

          {/* Second photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden shadow-lg"
          >
            <Image
              src={photo2}
              alt="Tara and Bandana"
              width={666.667}
              height={500}
              className="w-full object-cover"
            />
          </motion.div>

        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-[#8B7355]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p
            className="text-3xl md:text-4xl font-light mb-4 italic, text-center"
            style={{ fontFamily: "'Lora', serif", marginTop: '2rem' }}
          >
            In you, I have found my best friend, my partner in crime, and the love of my life. I can&apos;t wait to spend forever with you.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
