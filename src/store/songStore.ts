import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  votes: number;
  votedBy: Set<string>; // Track who voted to prevent duplicate votes
}

interface SongStore {
  songs: Song[];
  addSong: (title: string, artist: string, suggestedBy: string) => void;
  voteSong: (songId: string, userId: string) => void;
  getSortedSongs: () => Song[];
  hasUserVoted: (songId: string, userId: string) => boolean;
  setSongs: (songs: Song[]) => void;
  resetVotes: () => void;
  updateSongVotes: (songId: string) => void;
}

export const useSongStore = create<SongStore>((set, get) => ({
  songs: [],
  
  setSongs: (songs: Song[]) => {
    console.log('🏪 STORE: setSongs called with', songs.length, 'songs');
    console.log('🏪 STORE: Songs to set:', songs);
    set({ songs });
    console.log('🏪 STORE: setSongs complete, store state is now:', get().songs);
  },
  
  addSong: (title: string, artist: string, suggestedBy: string) => {
    set((state) => ({
      songs: [
        ...state.songs,
        {
          id: Date.now().toString(),
          title,
          artist,
          suggestedBy,
          votes: 0,
          votedBy: new Set(),
        },
      ],
    }));
  },
  
  voteSong: (songId: string, userId: string) => {
    set((state) => {
      const updatedSongs = state.songs.map((song) => {
        if (song.id === songId && !song.votedBy.has(userId)) {
          return {
            ...song,
            votes: song.votes + 1,
            votedBy: new Set([...song.votedBy, userId]),
          };
        }
        return song;
      });
      return { songs: updatedSongs };
    });
  },
  
  getSortedSongs: () => {
    return get().songs.sort((a, b) => b.votes - a.votes);
  },
  
  hasUserVoted: (songId: string, userId: string) => {
    const song = get().songs.find((s) => s.id === songId);
    return song ? song.votedBy.has(userId) : false;
  },
  
  updateSongVotes: (songId: string) => {
    set((state) => {
      const updatedSongs = state.songs.map((song) => {
        if (song.id === songId) {
          return {
            ...song,
            votes: song.votes + 1,
          };
        }
        return song;
      });
      return { songs: updatedSongs };
    });
  },
  
  resetVotes: () => {
    set((state) => ({
      songs: state.songs.map((song) => ({
        ...song,
        votes: 0,
        votedBy: new Set(),
      })),
    }));
  },
}));
