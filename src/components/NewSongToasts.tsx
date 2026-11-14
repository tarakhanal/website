'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Music, ThumbsUp } from 'lucide-react';

export type NewSongToast = { id: string; name: string; action: 'suggested' | 'voted for'; title: string };

type Props = {
  toasts: NewSongToast[];
  onDismiss: (id: string) => void;
};

export default function NewSongToasts({ toasts, onDismiss }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[65] flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      aria-live="polite"
      data-testid="new-song-toasts"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={() => onDismiss(toast.id)}
            className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-full border border-[#E8DDD5] bg-white/95 py-2 pl-2 pr-4 text-left shadow-lg shadow-[#8B7355]/15 backdrop-blur-md"
            style={{ touchAction: 'manipulation' }}
            data-testid={`new-song-toast-${toast.id}`}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF85]/20">
              {toast.action === 'voted for' ? (
                <ThumbsUp className="h-4 w-4 text-[#B08A5E]" />
              ) : (
                <Music className="h-4 w-4 text-[#B08A5E]" />
              )}
            </span>
            <span className="min-w-0 truncate text-sm text-[#6D5744]">
              <span className="font-semibold">{toast.name}</span> just {toast.action}{' '}
              <span className="font-semibold text-[#8B7355]">{toast.title}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
