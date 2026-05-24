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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 px-10 pt-12 pb-14"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#B0A090] mb-1">Navigate to venue</p>
          <h2 className="text-2xl font-bold text-[#3D3D3D]">Open in</h2>
        </div>

        {/* Map app buttons */}
        <div className="flex flex-col gap-4 items-center">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => {
                  onSelectApp(app.id as 'google' | 'apple' | 'waze');
                  onClose();
                }}
                className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl border border-[#E8DDD2] bg-[#FDFAF7] hover:bg-[#FAF4EE] hover:border-[#C4A882] hover:shadow-sm active:scale-[0.98] transition-all duration-150 font-medium text-[#3D3D3D] text-base"
                style={{ width: '220px' }}
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm border border-[#EEE8E0] flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span>{app.label}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-[#EEE8E0]" style={{ marginTop: '24px', marginBottom: '20px' }} />

        {/* Cancel */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
          <button
            onClick={onClose}
            className="transition-colors rounded-2xl border border-[#EEE8E0] hover:bg-[#FAF7F4] hover:text-[#5C4A32]"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '220px', padding: '8px 24px', fontSize: '15px', fontWeight: 600, color: '#8B7355' }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
