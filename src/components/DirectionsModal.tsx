'use client';

import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { SiApple, SiWaze } from 'react-icons/si';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (app: 'google' | 'apple' | 'waze') => void;
}

export default function DirectionsModal({ isOpen, onClose, onSelectApp }: DirectionsModalProps) {
  if (!isOpen) return null;

  const apps = [
    { id: 'google', label: 'Google Maps', icon: FcGoogle },
    { id: 'apple', label: 'Apple Maps', icon: SiApple },
    { id: 'waze', label: 'Waze Maps', icon: SiWaze },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-10"
      >
        <h2 className="text-3xl font-bold text-center text-[#3D3D3D] mb-10">Open in</h2>

        <div className="space-y-4 mb-8">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => {
                  onSelectApp(app.id as 'google' | 'apple' | 'waze');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-4 px-6 py-5 border-2 border-[#3D3D3D] rounded-lg font-semibold text-[#3D3D3D] text-lg hover:bg-[#f5f5f5] transition-colors"
              >
                <Icon className="w-7 h-7 flex-shrink-0" />
                <span>{app.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 text-center text-[#3D3D3D] font-semibold text-lg hover:text-[#8B7355] transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
