import { create } from 'zustand';

const STORAGE_STARTED = 'wedding_music_started';
const STORAGE_MUTED = 'wedding_music_muted';

function readBool(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) === 'true';
}

interface AudioStore {
  isMuted: boolean;
  hasStarted: boolean;
  setMuted: (muted: boolean) => void;
  setStarted: (started: boolean) => void;
  toggle: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initialise from localStorage so state survives page refreshes
  isMuted: readBool(STORAGE_MUTED),
  hasStarted: readBool(STORAGE_STARTED),

  setMuted: (muted) => {
    localStorage.setItem(STORAGE_MUTED, String(muted));
    set({ isMuted: muted });
  },

  setStarted: (started) => {
    localStorage.setItem(STORAGE_STARTED, String(started));
    set({ hasStarted: started });
  },

  toggle: () => {
    const next = !get().isMuted;
    localStorage.setItem(STORAGE_MUTED, String(next));
    set({ isMuted: next });
  },
}));
