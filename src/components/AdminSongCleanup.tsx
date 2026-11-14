'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getAllSongs, deleteSong, normalizeText, type SongData } from '@/lib/songs';

type Flag = 'duplicate' | 'test';

const songKey = (song: SongData) =>
  `${normalizeText(song.title).toLowerCase()}|${normalizeText(song.artist).toLowerCase()}`;

const looksLikeTest = (song: SongData) =>
  /\b(test|testing|asdf|sample)\b/i.test(`${song.title} ${song.artist}`);

export default function AdminSongCleanup() {
  const [songs, setSongs] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSongs = useCallback(async () => {
    setIsLoading(true);
    setSongs(await getAllSongs());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    getAllSongs().then((list) => {
      if (!active) return;
      setSongs(list);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const flagsById = useMemo(() => {
    const counts = new Map<string, number>();
    songs.forEach((song) => counts.set(songKey(song), (counts.get(songKey(song)) || 0) + 1));
    const flags: Record<string, Flag[]> = {};
    songs.forEach((song) => {
      const list: Flag[] = [];
      if ((counts.get(songKey(song)) || 0) > 1) list.push('duplicate');
      if (looksLikeTest(song)) list.push('test');
      flags[song.id] = list;
    });
    return flags;
  }, [songs]);

  const flaggedCount = songs.filter((song) => flagsById[song.id]?.length).length;
  const visibleSongs = onlyFlagged ? songs.filter((song) => flagsById[song.id]?.length) : songs;

  const handleDelete = async (song: SongData) => {
    const votesNote = song.vote_count > 0 ? ` and its ${song.vote_count} vote${song.vote_count === 1 ? '' : 's'}` : '';
    if (!confirm(`Remove "${song.title}" by ${song.artist}${votesNote}?`)) return;

    setDeletingId(song.id);
    setMessage(null);
    const ok = await deleteSong(song.id);
    setDeletingId(null);
    if (ok) {
      setSongs((prev) => prev.filter((s) => s.id !== song.id));
      setMessage(`Removed "${song.title}".`);
    } else {
      setMessage(`Could not remove "${song.title}". Please try again.`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-[#D4AF85]" data-testid="admin-song-cleanup">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#C41E3A]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Suggested Songs
          </h2>
          <p className="text-sm text-[#8B7355]">
            {songs.length} songs · {flaggedCount} look like tests or duplicates
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOnlyFlagged((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
              onlyFlagged ? 'bg-[#8B7355] text-white border-[#8B7355]' : 'bg-white text-[#8B7355] border-[#D4AF85] hover:bg-[#FAF6F2]'
            }`}
            data-testid="admin-songs-flagged-toggle"
          >
            {onlyFlagged ? 'Show all' : 'Only flagged'}
          </button>
          <button
            onClick={loadSongs}
            disabled={isLoading}
            className="px-4 py-2 bg-[#8B7355] text-white rounded-lg text-sm font-semibold hover:bg-[#6B5345] transition disabled:opacity-50"
            data-testid="admin-songs-refresh"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-3 rounded-lg bg-[#FAF6F2] px-3 py-2 text-sm text-[#6D5744]" data-testid="admin-songs-message">
          {message}
        </p>
      )}

      <ul className="max-h-[520px] overflow-y-auto divide-y divide-[#F1E8DF] rounded-lg border border-[#E8D5CC]">
        {visibleSongs.map((song) => (
          <li key={song.id} className="flex items-center gap-3 px-4 py-3" data-testid={`admin-song-row-${song.id}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#6D5744]">{song.title}</p>
              <p className="truncate text-xs text-[#8B7355]">
                {song.artist} · by {song.suggested_by} · {song.vote_count} vote{song.vote_count === 1 ? '' : 's'}
              </p>
            </div>
            {flagsById[song.id]?.map((flag) => (
              <span
                key={flag}
                className={`hidden sm:inline rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  flag === 'duplicate' ? 'bg-[#FFF1E0] text-[#A8641C]' : 'bg-[#F3ECE5] text-[#7A5E47]'
                }`}
              >
                {flag === 'duplicate' ? 'Duplicate' : 'Test?'}
              </span>
            ))}
            <button
              onClick={() => handleDelete(song)}
              disabled={deletingId === song.id}
              aria-label={`Remove ${song.title}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition disabled:opacity-50"
              data-testid={`admin-song-delete-${song.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deletingId === song.id ? 'Removing…' : 'Remove'}
            </button>
          </li>
        ))}
        {visibleSongs.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-500">
            {isLoading ? 'Loading songs…' : onlyFlagged ? 'Nothing flagged — the playlist looks clean.' : 'No songs yet.'}
          </li>
        )}
      </ul>
    </div>
  );
}
