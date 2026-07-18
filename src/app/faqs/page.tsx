'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqItems = [
  {
    question: 'What time should I arrive?',
    answer:
      'We request that guests arrive 15 minutes before the ceremony begins at 3:00 PM. This allows time for parking and getting settled. The ceremony will start promptly at 3:00 PM.',
  },
  {
    question: 'Is there parking available?',
    answer:
      'Guests will have access to a spacious parking area located directly in front of the reception hall for easy and convenient access.',
  },
  {
    question: 'What is the dress code?',
    answer:
      'Dress to impress! Whether you choose a sharp suit, an elegant gown, or traditional attire, we can\'t wait to celebrate with you in style.✨',
  },
  {
    question: 'Can I bring a date?',
    answer:
      'Guests are welcome to bring a plus one to the reception. We look forward to celebrating our big day with everyone!',
  },
  {
    question: 'Will the ceremony be indoors or outdoors?',
    answer:
      'The ceremony and reception will both be held indoors.',
  },
  {
    question: 'Can I take photos during the ceremony?',
    answer:
      'We ask that guests refrain from taking photos during the ceremony so everyone can be present and enjoy the moment together. Professional photos will be shared with all guests after the wedding!',
  },
  {
    question: 'What is the schedule for the day?',
    answer:
      'Please check our Timeline page for the full schedule. Key times: Ceremony at 3:00 PM, Cocktail Hour at 4:00 PM, Dinner at 5:00 PM, and dancing until 10:00 PM.',
  },
  {
    question: 'Will there be alcohol served?',
    answer:
      'Yes, we will have a full bar with beer, wine, and cocktails available throughout the reception. Non-alcoholic beverages will also be available.',
  },
  {
    question: 'What if I need to cancel or modify my RSVP?',
    answer:
      'Please let us know as soon as possible if your plans change. Contact us at +1 (415) 555-1234 or check your invitation for more details.',
  },
  {
    question: 'Will children be welcome?',
    answer:
      'We are delighted to welcome children to our reception! We kindly ask that parents keep a watchful eye on their little ones throughout the celebration so everyone can enjoy the evening safely.',
  },
  {
    question: 'How can I help or contribute?',
    answer:
      "Your presence is the greatest gift! If you have special talents or skills you'd like to share (music, photography, etc.), please reach out to us directly.",
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(0);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F1ED]">
      <Navigation />

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-5xl md:text-6xl font-bold text-[#3D3D3D] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto">
            Find answers to common questions about our wedding
          </p>
        </motion.div>
      </section>

      {/* FAQ Items */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-3"
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === index ? null : index)
                }
                className="w-full text-left transition-transform hover:translate-x-1"
                style={{ touchAction: 'manipulation' }}
              >
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#D4AF85] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-lg md:text-xl font-semibold text-[#8B7355]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.question}
                    </h3>
                    <motion.div
                      animate={{
                        rotate: expandedId === index ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-[#D4AF85] flex-shrink-0" />
                    </motion.div>
                  </div>
                </div>
              </button>

              <motion.div
                variants={expandVariants}
                animate={expandedId === index ? 'expanded' : 'collapsed'}
                initial="collapsed"
                className="overflow-hidden"
              >
                <div className="p-6 bg-[#F5F1ED]/50 border-l-4 border-[#D4AF85] border-t-0 rounded-b-lg">
                  <p className="text-[#3D3D3D] leading-relaxed">{item.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#8B7355]/10">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2
            className="text-3xl font-bold text-[#8B7355] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Still Have Questions?
          </h2>
          <p className="text-[#3D3D3D] mb-6">
            Don't hesitate to reach out! We're happy to help with any questions or
            concerns.
          </p>
          <a
            href="tel:+14155551234"
            className="inline-block px-8 py-3 bg-[#8B7355] text-white rounded-full font-semibold hover:bg-[#6B5345] transition-colors hover:scale-105 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            Contact Us
          </a>
        </motion.div>
      </section>
    </main>
  );
}
