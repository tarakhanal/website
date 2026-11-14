import { supabase } from './supabase';

export interface SongData {
  id: string;
  title: string;
  artist: string;
  suggested_by: string;
  vote_count: number;
  album_name?: string | null;
  artwork_url?: string | null;
  preview_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SongVoteData {
  song_id: string;
  user_id: string;
  voter_name?: string | null;
}

// iPhone "Smart Punctuation" turns ' and " into curly quotes; normalize so
// "Can’t Help Falling" and "Can't Help Falling" are treated as the same song.
export const normalizeText = (value?: string | null): string =>
  (value || '')
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeVoterName = (name?: string | null): string => normalizeText(name);

// Escape LIKE wildcards so titles such as "100%" or "Hey_Jude" match literally.
const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (c) => `\\${c}`);

const describeError = (error: unknown): string => {
  if (!error) return 'unknown error';
  if (typeof error === 'string') return error;
  const e = error as { code?: string; message?: string; details?: string | null; hint?: string | null };
  return [e.code, e.message, e.details, e.hint].filter(Boolean).join(' | ') || String(error);
};

export type VoteSubmitReason =
  | 'success'
  | 'duplicate_user'
  | 'duplicate_name'
  | 'rate_limit_song_24h'
  | 'rate_limit_day'
  | 'guest_limit'
  | 'rate_limit_network'
  | 'network_song_limit'
  | 'song_not_found'
  | 'setup_required'
  | 'error';

export type VoteSubmitResult = {
  ok: boolean;
  reason: VoteSubmitReason;
  votesLeft: number | null;
};

type VoteRpcPayload = {
  ok?: boolean;
  reason?: VoteSubmitReason;
  votes_left?: number | null;
  error_code?: string;
  error_message?: string;
};

export type RemoveVoteResult = {
  ok: boolean;
  reason: 'removed' | 'not_voted' | 'setup_required' | 'error';
  votesLeft: number | null;
};

export type GuestVoteStatus = {
  remaining: number;
  votedSongIds: string[];
};

export type AddSongResult =
  | { ok: true; song: SongData }
  | { ok: false; reason: 'duplicate' | 'error'; message: string };

// Missing/broken DB functions: PGRST202 = RPC not found, 42883 = a function it
// calls (e.g. pgcrypto digest) not found. Both mean the SQL setup needs running.
const isSetupError = (error: { code?: string; message?: string }): boolean =>
  error.code === 'PGRST202' ||
  error.code === '42883' ||
  /could not find the function|does not exist/i.test(error.message || '');

// Fetch all songs from Supabase, ordered by vote count
export async function getAllSongs(): Promise<SongData[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('vote_count', { ascending: false });

  if (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
  
  return data || [];
}

// Check if a song already exists (case-insensitive)
export async function checkDuplicateSong(title: string, artist: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('id')
      .ilike('title', escapeLike(normalizeText(title)))
      .ilike('artist', escapeLike(normalizeText(artist)));

    if (error) {
      console.error('Error checking duplicate song:', error);
      return false;
    }

    return !!(data && data.length > 0);
  } catch (err) {
    console.error('Unexpected error checking duplicate song:', err);
    return false;
  }
}

// Add a new song with suggester name
export async function addSongToDb(
  title: string,
  artist: string,
  suggestedBy: string,
  metadata?: {
    albumName?: string | null;
    artworkUrl?: string | null;
    previewUrl?: string | null;
  }
): Promise<AddSongResult> {
  const cleanTitle = normalizeText(title);
  const cleanArtist = normalizeText(artist);
  const cleanName = normalizeText(suggestedBy) || 'Guest';

  try {
    const isDuplicate = await checkDuplicateSong(cleanTitle, cleanArtist);
    if (isDuplicate) {
      return { ok: false, reason: 'duplicate', message: 'This song has already been suggested.' };
    }

    const row: Record<string, string | number | null> = {
      title: cleanTitle,
      artist: cleanArtist,
      suggested_by: cleanName,
      vote_count: 0,
      album_name: metadata?.albumName || null,
      artwork_url: metadata?.artworkUrl || null,
    };
    if (metadata?.previewUrl) row.preview_url = metadata.previewUrl;

    let { data, error } = await supabase.from('songs').insert([row]).select().single();

    // preview_url column missing (MUSIC_VOTES_V2.sql not run yet) — save the song without it.
    if (error && row.preview_url && /preview_url/i.test(error.message || '')) {
      console.warn('[music] songs.preview_url column missing; saving without preview. Run MUSIC_VOTES_V2.sql.');
      delete row.preview_url;
      ({ data, error } = await supabase.from('songs').insert([row]).select().single());
    }

    if (error) {
      console.error('[music] Error inserting song:', describeError(error), error);
      return { ok: false, reason: 'error', message: describeError(error) };
    }

    return { ok: true, song: data as SongData };
  } catch (error) {
    console.error('[music] Unexpected error adding song:', describeError(error), error);
    return { ok: false, reason: 'error', message: describeError(error) };
  }
}

// Check if a user has already voted for a specific song
export async function hasUserVotedForSong(songId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('song_votes')
    .select('id')
    .eq('song_id', songId)
    .eq('user_id', userId)
    .single();

  if (error) {
    // PGRST116 means no rows found, which is what we want
    if (error.code === 'PGRST116') {
      return false;
    }
    console.error('Error checking vote:', error);
    return false;
  }

  return !!data;
}

// Check if a voter name has already voted for a specific song (case-insensitive)
export async function hasVoterNameVotedForSong(songId: string, voterName: string): Promise<boolean> {
  const normalizedName = normalizeVoterName(voterName);
  if (!normalizedName) return false;

  const { data, error } = await supabase
    .from('song_votes')
    .select('id')
    .eq('song_id', songId)
    .ilike('voter_name', normalizedName)
    .limit(1);

  if (error) {
    console.error('Error checking voter name vote:', error);
    return false;
  }

  return !!(data && data.length > 0);
}

// Submit a vote through server-side RPC so anti-abuse checks are enforced in one place
export async function submitSongVote(
  songId: string,
  userId: string,
  voterName?: string | null
): Promise<VoteSubmitResult> {
  const normalizedName = normalizeVoterName(voterName);

  try {
    const { data, error } = await supabase.rpc('submit_song_vote', {
      p_song_id: songId,
      p_user_id: userId,
      p_voter_name: normalizedName || null,
    });

    if (error) {
      console.error('[music] submit_song_vote failed:', describeError(error), error);
      return { ok: false, reason: isSetupError(error) ? 'setup_required' : 'error', votesLeft: null };
    }

    if (!data || typeof data !== 'object') {
      console.error('[music] submit_song_vote returned an unexpected payload:', data);
      return { ok: false, reason: 'error', votesLeft: null };
    }

    const response = data as VoteRpcPayload;
    if (response.ok !== true && response.reason === 'error') {
      console.error('[music] submit_song_vote rejected the vote:', response.error_code, response.error_message);
    }

    if (response.ok === true) {
      return {
        ok: true,
        reason: 'success',
        votesLeft: typeof response.votes_left === 'number' ? response.votes_left : null,
      };
    }

    return {
      ok: false,
      reason: response.reason || 'error',
      votesLeft: typeof response.votes_left === 'number' ? response.votes_left : null,
    };
  } catch (err) {
    console.error('[music] Error submitting vote:', describeError(err), err);
    return { ok: false, reason: 'error', votesLeft: null };
  }
}

// Votes left + songs this guest (device id or same name) currently votes for.
export async function getGuestVoteStatus(
  userId: string,
  voterName?: string | null
): Promise<GuestVoteStatus | null> {
  if (!userId) return null;
  try {
    const { data, error } = await supabase.rpc('get_guest_vote_status', {
      p_user_id: userId,
      p_voter_name: normalizeVoterName(voterName) || null,
    });

    if (error) {
      console.error('[music] get_guest_vote_status failed:', describeError(error), error);
      if (isSetupError(error)) {
        // MUSIC_VOTES_V2.sql not run yet — fall back to the old counter.
        const remaining = await getRemainingVoteCredits();
        return remaining === null ? null : { remaining, votedSongIds: [] };
      }
      return null;
    }

    const payload = (data || {}) as { remaining?: number; voted_song_ids?: string[] | null };
    if (typeof payload.remaining !== 'number') return null;

    return {
      remaining: Math.max(0, Math.min(5, payload.remaining)),
      votedSongIds: Array.isArray(payload.voted_song_ids) ? payload.voted_song_ids : [],
    };
  } catch (err) {
    console.error('[music] Error fetching guest vote status:', describeError(err), err);
    return null;
  }
}

export async function getRemainingVoteCredits(): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('get_vote_credits_remaining');

    if (error) {
      console.error('[music] get_vote_credits_remaining failed:', describeError(error), error);
      return null;
    }

    if (!data || typeof data !== 'object') return null;

    const payload = data as { remaining?: number | null };
    if (typeof payload.remaining !== 'number') return null;

    return Math.max(0, Math.min(5, payload.remaining));
  } catch (err) {
    console.error('Error fetching remaining vote credits:', err);
    return null;
  }
}

// Add a vote for a song
export async function voteSong(songId: string, userId: string): Promise<boolean> {
  const result = await submitSongVote(songId, userId, null);
  return result.ok;
}

// Add a vote for a song with optional voter display name
export async function voteSongWithName(
  songId: string,
  userId: string,
  voterName?: string | null
): Promise<boolean> {
  const result = await submitSongVote(songId, userId, voterName);
  return result.ok;
}

// Fetch voter names grouped by song IDs
export async function getSongVotersBySongIds(songIds: string[]): Promise<Record<string, string[]>> {
  if (songIds.length === 0) return {};

  const { data, error } = await supabase
    .from('song_votes')
    .select('song_id, voter_name')
    .in('song_id', songIds);

  if (error) {
    console.error('Error fetching song voters:', error);
    return {};
  }

  const grouped: Record<string, string[]> = {};

  for (const row of data as Array<{ song_id: string; voter_name: string | null }>) {
    if (!grouped[row.song_id]) {
      grouped[row.song_id] = [];
    }
    grouped[row.song_id].push(row.voter_name?.trim() || 'Guest');
  }

  return grouped;
}

// Remove a vote so it can be used on another song (server enforces ownership)
export async function removeSongVote(
  songId: string,
  userId: string,
  voterName?: string | null
): Promise<RemoveVoteResult> {
  try {
    const { data, error } = await supabase.rpc('remove_song_vote', {
      p_song_id: songId,
      p_user_id: userId,
      p_voter_name: normalizeVoterName(voterName) || null,
    });

    if (error) {
      console.error('[music] remove_song_vote failed:', describeError(error), error);
      return { ok: false, reason: isSetupError(error) ? 'setup_required' : 'error', votesLeft: null };
    }

    const payload = (data || {}) as { ok?: boolean; reason?: RemoveVoteResult['reason']; votes_left?: number | null; error_code?: string; error_message?: string };
    if (payload.reason === 'error') {
      console.error('[music] remove_song_vote rejected:', payload.error_code, payload.error_message);
    }

    return {
      ok: payload.ok === true,
      reason: payload.reason || (payload.ok ? 'removed' : 'error'),
      votesLeft: typeof payload.votes_left === 'number' ? payload.votes_left : null,
    };
  } catch (err) {
    console.error('[music] Error removing vote:', describeError(err), err);
    return { ok: false, reason: 'error', votesLeft: null };
  }
}

// Remember a song's 30-second preview link so later visitors don't need to look it up.
export async function saveSongPreviewUrl(songId: string, previewUrl: string): Promise<void> {
  const { error } = await supabase
    .from('songs')
    .update({ preview_url: previewUrl })
    .eq('id', songId)
    .is('preview_url', null);
  if (error) {
    console.warn('[music] Could not save preview link:', describeError(error));
  }
}

// Delete a song entirely
export async function deleteSong(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting song:', error);
    return false;
  }

  return true;
}
