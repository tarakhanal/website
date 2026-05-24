'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Gift, ExternalLink } from 'lucide-react';

export default function RegistryPage() {
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-[#D4AF85]" />
            <h1
              className="text-5xl md:text-6xl font-bold text-[#3D3D3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Registry
            </h1>
          </div>
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto">
            Thank you for celebrating with us! Your presence is our greatest gift.
            If you'd like to give us a gift, we've created registries at Amazon.
          </p>
        </motion.div>
      </section>

      {/* Registry Options */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-12"
          >
            {/* Amazon Registry */}
            <motion.a
              href="https://www.amazon.com/wedding/guest-view/7JBIJU9AX8H4"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, boxShadow: '0 15px 40px rgba(139, 115, 85, 0.2)' }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-lg shadow-lg"
            >
              <div className="bg-gradient-to-r from-[#8B7355] to-[#A8886A] p-8 md:p-12 text-white relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-3xl md:text-4xl font-bold mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Amazon Registry
                    </h3>
                    <p className="text-lg font-light opacity-90 mb-6 max-w-md">
                      Browse our curated selection of items we love and use.
                      Everything from home essentials to experiences we'll
                      cherish together.
                    </p>
                  </div>
                  <ExternalLink className="w-8 h-8 flex-shrink-0" />
                </div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-sm backdrop-blur-sm transition-all"
                >
                  View Registry
                  <ExternalLink className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Decorative Background */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"
              />
            </motion.a>
          </motion.div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              variants={itemVariants}
              className="p-8 bg-white rounded-lg shadow-md border-l-4 border-[#D4AF85]"
            >
              <h3
                className="text-2xl font-bold text-[#8B7355] mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                What We're Registered For
              </h3>
              <ul className="text-[#3D3D3D] space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF85] font-bold">•</span>
                  <span>Kitchen appliances and cookware</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF85] font-bold">•</span>
                  <span>Home decor and furnishings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF85] font-bold">•</span>
                  <span>Bedding and bathroom essentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF85] font-bold">•</span>
                  <span>Outdoor and garden items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF85] font-bold">•</span>
                  <span>Experiences and travel items</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 bg-white rounded-lg shadow-md border-l-4 border-[#D4AF85]"
            >
              <h3
                className="text-2xl font-bold text-[#8B7355] mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Frequently Asked
              </h3>
              <div className="text-sm text-[#3D3D3D] space-y-3">
                <div>
                  <p className="font-semibold text-[#8B7355] mb-1">
                    Do we need gifts?
                  </p>
                  <p className="text-xs">
                    Your presence is the greatest gift. No gift is expected or
                    required!
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#8B7355] mb-1">
                    Can I give cash or experiences?
                  </p>
                  <p className="text-xs">
                    Absolutely! Gifts or cash towards our honeymoon are wonderful
                    alternatives.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Thank You Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#8B7355]/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p
            className="text-2xl md:text-3xl font-light italic text-[#8B7355] mb-4"
            style={{ fontFamily: "'Lora', serif" }}
          >
            "Your love and support mean everything to us."
          </p>
          <p className="text-[#3D3D3D]">
            Whether you bring a gift or simply bring yourself, we're thrilled
            you'll be part of our celebration.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
