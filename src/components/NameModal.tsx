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
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <h2
                className="mb-0 text-2xl font-bold leading-tight text-[#3D3D3D]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Before you continue...
              </h2>
              <button
                onClick={onCancel}
                aria-label="Close"
                className="-mr-2 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#F5F1ED]"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6 space-y-1.5">
              <p className="mb-0 text-base leading-relaxed text-[#8B7355]">
                Please tell us your name so we know who suggested and liked each song! 🎵
              </p>
              <p className="mb-0 text-sm leading-relaxed text-[#9B866F]">
                (Please put your actual name here.)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="guest-name-input" className="ui-label">
                  Your name
                </label>
                <input
                  id="guest-name-input"
                  autoComplete="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your name"
                  className="ui-input"
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

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                <button
                  type="submit"
                  className="ui-btn ui-btn-primary w-full sm:w-auto sm:flex-1"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="ui-btn ui-btn-ghost w-full sm:w-auto sm:flex-1"
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
