'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useSongStore } from '@/store/songStore';
import { useState, useEffect } from 'react';
import { Music, ThumbsUp, Plus } from 'lucide-react';

export default function MusicPage() {
  const { songs, addSong, voteSong, getSortedSongs, hasUserVoted } = useSongStore();
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [userId, setUserId] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    // Generate or retrieve a unique user ID
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newArtist.trim()) {
      addSong(newTitle, newArtist);
      setNewTitle('');
      setNewArtist('');
      setIsFormVisible(false);
    }
  };

  const handleVote = (songId: string) => {
    voteSong(songId, userId);
  };

  const sortedSongs = getSortedSongs();

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const songVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-[#D4AF85]" />
            <h1
              className="text-5xl md:text-6xl font-bold text-[#3D3D3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Reception Music
            </h1>
          </div>
          <p className="text-xl text-[#8B7355] font-light max-w-2xl mx-auto">
            Help us create the perfect playlist! Suggest songs and vote for your
            favorites. The songs with the most votes will be played at our reception.
          </p>
        </motion.div>
      </section>

      {/* Add Song Form */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-full mb-6 px-6 py-3 bg-[#D4AF85] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#C1A78C] transition-colors hover:scale-105 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <Plus className="w-5 h-5" />
            Suggest a Song
          </button>

          <AnimatePresence>
            {isFormVisible && (
              <motion.form
                initial={{ opacity: 1, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleAddSong}
                className="bg-white p-6 rounded-lg shadow-md mb-8"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7355] mb-2">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter song title"
                      className="w-full px-4 py-2 border border-[#E8DDD5] rounded-lg focus:outline-none focus:border-[#D4AF85] focus:ring-2 focus:ring-[#D4AF85]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7355] mb-2">
                      Artist *
                    </label>
                    <input
                      type="text"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      placeholder="Enter artist name"
                      className="w-full px-4 py-2 border border-[#E8DDD5] rounded-lg focus:outline-none focus:border-[#D4AF85] focus:ring-2 focus:ring-[#D4AF85]/20"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#8B7355] text-white rounded-lg font-semibold hover:bg-[#6B5345] transition-colors hover:scale-105 active:scale-95"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Add Song
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                      className="flex-1 px-4 py-2 border border-[#D4AF85] text-[#8B7355] rounded-lg font-semibold hover:bg-[#F5F1ED] transition-colors hover:scale-105 active:scale-95"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Songs List */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-[#8B7355] mb-8 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Suggested Songs
          </motion.h2>

          {sortedSongs.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12 bg-white/50 rounded-lg"
            >
              <p className="text-[#8B7355] text-lg">
                No songs suggested yet. Be the first to suggest one!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {sortedSongs.map((song, index) => {
                  const hasVoted = hasUserVoted(song.id, userId);
                  return (
                    <motion.div
                      key={song.id}
                      variants={songVariants}
                      layout
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-[#D4AF85] w-8">
                              #{index + 1}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-[#8B7355] truncate">
                                {song.title}
                              </h3>
                              <p className="text-sm text-[#3D3D3D] truncate">
                                by {song.artist}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleVote(song.id)}
                          disabled={hasVoted}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all flex-shrink-0 hover:scale-110 active:scale-90 ${
                            hasVoted
                              ? 'bg-[#D4AF85]/30 text-[#8B7355] cursor-not-allowed'
                              : 'bg-[#D4AF85] text-white hover:bg-[#C1A78C]'
                          }`}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-bold">{song.votes}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </section>

      {/* Info Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#8B7355]/10">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h2
            className="text-2xl font-bold text-[#8B7355] mb-4 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4AF85] mb-2">1</div>
              <p className="text-[#3D3D3D]">
                <span className="font-semibold">Suggest</span> your favorite songs
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4AF85] mb-2">2</div>
              <p className="text-[#3D3D3D]">
                <span className="font-semibold">Vote</span> for songs you love (one vote per song)
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D4AF85] mb-2">3</div>
              <p className="text-[#3D3D3D]">
                <span className="font-semibold">Enjoy</span> the top-voted songs at our reception!
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
