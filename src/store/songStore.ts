import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist: string;
  votes: number;
  votedBy: Set<string>; // Track who voted to prevent duplicate votes
}

interface SongStore {
  songs: Song[];
  addSong: (title: string, artist: string) => void;
  voteSong: (songId: string, userId: string) => void;
  getSortedSongs: () => Song[];
  hasUserVoted: (songId: string, userId: string) => boolean;
}

export const useSongStore = create<SongStore>((set, get) => ({
  songs: [
    {
      id: '1',
      title: 'Can\'t Help Falling in Love',
      artist: 'Elvis Presley',
      votes: 5,
      votedBy: new Set(),
    },
    {
      id: '2',
      title: 'Perfect',
      artist: 'Ed Sheeran',
      votes: 3,
      votedBy: new Set(),
    },
    {
      id: '3',
      title: 'All of Me',
      artist: 'John Legend',
      votes: 4,
      votedBy: new Set(),
    },
  ],
  
  addSong: (title: string, artist: string) => {
    set((state) => ({
      songs: [
        ...state.songs,
        {
          id: Date.now().toString(),
          title,
          artist,
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
}));
