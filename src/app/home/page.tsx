'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useCountdown } from '@/hooks/useCountdown';
import { Phone, MapPin } from 'lucide-react';

export default function HomePage() {
  const { days, hours, minutes, seconds } = useCountdown();

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
      <section className="relative min-h-[60vh] flex flex-col justify-center py-12 bg-gradient-to-r from-[#F5F1ED] via-white/60 to-[#F5F1ED]" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10 pointer-events-none" />

        {/* Top row: right to left */}
        <div className="overflow-hidden w-full">
          <motion.div
            className="flex w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 60, ease: 'linear' } }}
          >
            {[...Array(2)].flatMap((_, setIndex) =>
              [
                '04446EEE-0136-418E-8902-62C240512589_1_105_c.jpeg',
                '2541030F-6D6B-4371-A4BA-3C32119F9069_1_105_c.jpeg',
                '2A9431D3-9F4F-437A-B5C6-E17595A55B57_1_105_c.jpeg',
                '38D3FC1B-AD16-4FDF-9F54-BB48A4A29A56_1_105_c.jpeg',
                '3BBD37D8-1EDA-4B45-A8DA-26F5C2B40DEA_1_105_c.jpeg',
                '41C52320-34D7-49B6-95B3-B4D49271D9B7_1_105_c.jpeg',
                '7CD00EBC-D6FC-44D1-B8CF-21BD319CEE49_1_105_c.jpeg',
                '8C1C35BA-2AAA-4A19-8D1F-272F7C119B69_1_105_c.jpeg',
                '95FA751A-7DC3-497B-9912-C832408865D8_1_105_c.jpeg',
                '9B540E62-DA4C-4F60-93CE-C4784369E726_1_105_c.jpeg',
                'AB20A646-3F68-4945-9E85-3BE4932307FC_1_105_c.jpeg',
                'B48CEB98-E69A-4C1E-9798-CFE315E7D9A5_1_105_c.jpeg',
                'B7CF0A72-82A0-49D4-B451-BA5BBAA4D442_1_105_c.jpeg',
                'DBDF2D51-A9DF-4BC1-87DC-58089D0AB3FD_1_105_c.jpeg',
                'EDEB0BCA-CAF3-4E72-B050-9233443B7C6A_1_105_c.jpeg',
                'EE4E2EFE-9BC4-4E66-A3E5-5D37E31898C5_1_105_c.jpeg',
                'EEC2C875-CEA2-47C8-940C-D56522D07FE8_1_105_c.jpeg',
                'F04BA61A-C8E5-4940-983E-FB4CFAAA77C7_1_105_c.jpeg',
              ].map((filename, i) => (
                <div key={`top-${setIndex}-${i}`} className="flex-shrink-0 w-[370px] h-[260px] overflow-hidden">
                  <img
                    src={`/images/${filename}`}
                    alt={`Wedding photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* Middle text */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem', position: 'relative', zIndex: 20, width: '100%', overflow: 'visible' }}>
          <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '5.52vw', lineHeight: 1.1, whiteSpace: 'nowrap', color: '#8B7355', display: 'block' }}>
            Tara &amp; Bandana
          </span>
        </div>

        {/* Bottom row: left to right */}
        <div className="overflow-hidden w-full">
          <motion.div
            className="flex w-max"
            animate={{ x: ['-50%', '0%'] }}
            transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 60, ease: 'linear' } }}
          >
            {[...Array(2)].flatMap((_, setIndex) =>
              [
                'F04BA61A-C8E5-4940-983E-FB4CFAAA77C7_1_105_c.jpeg',
                'EEC2C875-CEA2-47C8-940C-D56522D07FE8_1_105_c.jpeg',
                'EE4E2EFE-9BC4-4E66-A3E5-5D37E31898C5_1_105_c.jpeg',
                'EDEB0BCA-CAF3-4E72-B050-9233443B7C6A_1_105_c.jpeg',
                'DBDF2D51-A9DF-4BC1-87DC-58089D0AB3FD_1_105_c.jpeg',
                'B7CF0A72-82A0-49D4-B451-BA5BBAA4D442_1_105_c.jpeg',
                'B48CEB98-E69A-4C1E-9798-CFE315E7D9A5_1_105_c.jpeg',
                'AB20A646-3F68-4945-9E85-3BE4932307FC_1_105_c.jpeg',
                '9B540E62-DA4C-4F60-93CE-C4784369E726_1_105_c.jpeg',
                '95FA751A-7DC3-497B-9912-C832408865D8_1_105_c.jpeg',
                '8C1C35BA-2AAA-4A19-8D1F-272F7C119B69_1_105_c.jpeg',
                '7CD00EBC-D6FC-44D1-B8CF-21BD319CEE49_1_105_c.jpeg',
                '41C52320-34D7-49B6-95B3-B4D49271D9B7_1_105_c.jpeg',
                '3BBD37D8-1EDA-4B45-A8DA-26F5C2B40DEA_1_105_c.jpeg',
                '38D3FC1B-AD16-4FDF-9F54-BB48A4A29A56_1_105_c.jpeg',
                '2A9431D3-9F4F-437A-B5C6-E17595A55B57_1_105_c.jpeg',
                '2541030F-6D6B-4371-A4BA-3C32119F9069_1_105_c.jpeg',
                '04446EEE-0136-418E-8902-62C240512589_1_105_c.jpeg',
              ].map((filename, i) => (
                <div key={`bot-${setIndex}-${i}`} className="flex-shrink-0 w-[370px] h-[260px] overflow-hidden">
                  <img
                    src={`/images/${filename}`}
                    alt={`Wedding photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ))
            )}
          </motion.div>
        </div>
      </section>
           <div className="h-16" />
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-[#3D3D3D] mb-4"
            style={{ fontFamily: "'Great Vibes', cursive", color: '#b39979ff' }}
          >
            Our Forever Starts In
          </motion.h1>

          {/* <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold text-[#8B7355] mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Tara & Bandana
          </motion.h2> */}

          {/* <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 mb-12">
            <span className="text-lg text-[#3D3D3D] font-light">May 8, 2027 📍 Pittsburgh, Pennsylvania</span>
            <span className="text-lg text-[#3D3D3D] font-light">May 9, 2027 📍 Columbus, Ohio</span>
          </motion.div> */}

          <motion.div variants={itemVariants} className="flex justify-center items-center gap-8 md:gap-16 mb-20 w-full">
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontFamily: "'Great Vibes', cursive" }} className="font-bold text-[#8B7355]">{days}</div>
              <div className="text-base text-[#8B7355] uppercase tracking-wider mt-2">Days</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontFamily: "'Great Vibes', cursive" }} className="font-bold text-[#8B7355]">{hours}</div>
              <div className="text-base text-[#8B7355] uppercase tracking-wider mt-2">Hours</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontFamily: "'Great Vibes', cursive" }} className="font-bold text-[#8B7355]">{minutes}</div>
              <div className="text-base text-[#8B7355] uppercase tracking-wider mt-2">Minutes</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontFamily: "'Great Vibes', cursive"}} className="font-bold text-[#8B7355]">{seconds}</div>
              <div className="text-base text-[#8B7355] uppercase tracking-wider mt-2">Seconds</div>
            </div>
          </motion.div>
          <p style={{ marginTop: '2rem', fontSize: '2.5rem', color: '#8B7355', fontFamily: "'Great Vibes', cursive" }}>05. 08. 2027</p>
          {/* <p style={{ marginTop: '2rem', fontSize: '1.5rem', color: '#8B7355' }}>May 8, 2027</p> */}
          <p style={{ marginTop: '2rem', fontSize: '2.0rem', color: '#8B7355', fontFamily: "'Great Vibes', cursive" }}>We can't wait to celebrate with you!</p>
          <div className="h-16" />

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            
            
          </motion.div>

          {/* Location */}
          <motion.div variants={itemVariants} className="min-h-screen flex flex-col items-center justify-center text-center py-24 border-b border-[#E8E0D5]">
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4 flex items-center justify-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <MapPin className="w-6 h-6" />
              Location
            </h3>
            <p className="text-lg text-[#3D3D3D] mb-2">
              <span className="font-semibold">Pittsburgh, Pennsylvania</span>
            </p>
            <div className="w-full mt-4 rounded-xl overflow-hidden shadow-lg" style={{ maxWidth: '600px' }}>
              <iframe
                title="Pittsburgh, PA"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d97877.84846116953!2d-80.07757!3d40.44062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8834f16f48068503%3A0x8df915a15aa21b34!2sPittsburgh%2C%20PA!5e0!3m2!1sen!2sus!4v1713000000000"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
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
          className="max-w-4xl mx-auto grid grid-cols-1 gap-0"
        >
          {/* Date & Time */}
          <motion.div variants={itemVariants} className="min-h-screen flex flex-col items-center justify-center text-center py-24 border-b border-[#E8E0D5]">
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
            <p>Want your favorite songs to be played at our reception?</p>
            <motion.a
              href="/music"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(212, 175, 133, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-[#D4AF85] text-[#8B7355] rounded-full font-semibold uppercase tracking-wide text-sm transition-all"
            >
              Suggest Songs
            </motion.a>
          </motion.div>

          {/* Registry */}
          <motion.div
            variants={itemVariants}
            className="min-h-screen flex flex-col items-center justify-center text-center py-24 bg-gradient-to-r from-[#8B7355] to-[#A8896C] rounded-2xl shadow-lg my-8 px-8"
          >
            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              🎁 Registry
            </h3>
            <p className="text-white/80 mb-5 text-lg">Your love and presence is the greatest gift — but if you'd like to celebrate us, explore our registry!</p>
            <motion.a
              href="/registry"
              whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-3 bg-white text-[#8B7355] rounded-full font-bold text-base uppercase tracking-wide shadow-md"
            >
              View Registry
            </motion.a>
          </motion.div>
        </motion.div>

        <div className="h-12" />

        {/* Contact */}
          <div className="max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center text-center py-24">
            <h3
              className="text-2xl font-bold text-[#8B7355] mb-4 flex items-center justify-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <Phone className="w-6 h-6" />
              Contact
            </h3>
            <p className="text-lg text-[#3D3D3D]">
              <a href="tel:+14125060479" className="hover:text-[#D4AF85] transition-colors">
                +1 (412) 506-0479
              </a>
            </p>
          </div>
      </section>
    </main>
  );
}
