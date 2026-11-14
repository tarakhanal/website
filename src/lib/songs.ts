import { supabase } from './supabase';

export interface SongData {
  id: string;
  title: string;
  artist: string;
  suggested_by: string;
  vote_count: number;
  album_name?: string | null;
  artwork_url?: string | null;
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

    const { data, error } = await supabase
      .from('songs')
      .insert([
        {
          title: cleanTitle,
          artist: cleanArtist,
          suggested_by: cleanName,
          vote_count: 0,
          album_name: metadata?.albumName || null,
          artwork_url: metadata?.artworkUrl || null,
        },
      ])
      .select()
      .single();

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

// Remove a vote for a song
export async function removeSongVote(songId: string, userId: string): Promise<boolean> {
  try {
    // Delete vote
    const { error: deleteError } = await supabase
      .from('song_votes')
      .delete()
      .eq('song_id', songId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error removing vote:', deleteError);
      return false;
    }

    // Decrement vote count
    const { error: updateError } = await supabase.rpc('decrement_song_votes', {
      p_song_id: songId,
    });

    if (updateError) {
      console.error('Error decrementing vote count:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error removing vote:', err);
    return false;
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
