import { create } from 'zustand';

const STORAGE_STARTED = 'wedding_music_started';
const STORAGE_MUTED = 'wedding_music_muted';

interface AudioStore {
  isMuted: boolean;
  hasStarted: boolean;
  hydrated: boolean;
  setMuted: (muted: boolean) => void;
  setStarted: (started: boolean) => void;
  toggle: () => void;
  hydrate: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Always start with false on both server and client — hydrate() loads real values after mount
  isMuted: false,
  hasStarted: false,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const isMuted = localStorage.getItem(STORAGE_MUTED) === 'true';
    const hasStarted = localStorage.getItem(STORAGE_STARTED) === 'true';
    set({ isMuted, hasStarted, hydrated: true });
  },

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
