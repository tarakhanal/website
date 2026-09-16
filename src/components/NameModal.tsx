'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

interface NameModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export default function NameModal({ isOpen, onSubmit, onCancel }: NameModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    onSubmit(trimmedName);
    setName('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 md:p-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-2xl font-bold text-[#3D3D3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Before you continue...
              </h2>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-[#8B7355] text-base leading-relaxed">
                Please tell us your name so we know who suggested and liked each song! 🎵
              </p>
              <p className="text-sm text-[#9B866F] leading-relaxed">
                (Please put your actual name here.)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-[#E8DDD5] rounded-lg focus:outline-none focus:border-[#D4AF85] focus:ring-2 focus:ring-[#D4AF85]/20 text-[#3D3D3D]"
                  autoFocus
                />
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-red-500 text-sm mt-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#8B7355] text-white rounded-lg font-semibold hover:bg-[#6B5345] transition-colors hover:scale-105 active:scale-95"
                  style={{ touchAction: 'manipulation' }}
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 border border-[#E8DDD5] text-[#8B7355] rounded-lg font-semibold hover:bg-[#F5F1ED] transition-colors hover:scale-105 active:scale-95"
                  style={{ touchAction: 'manipulation' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
