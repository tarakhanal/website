import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface GuestCode {
  id?: string;
  code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface MusicUsageStats {
  songs_count: number;
  song_votes_count: number;
  songs_table_bytes: number;
  song_votes_table_bytes: number;
  total_music_bytes: number;
}

// Fetch all guest codes
export async function getAllGuestCodes(): Promise<GuestCode[]> {
  const { data, error } = await supabase
    .from('guest_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guest codes:', error);
    return [];
  }

  return data || [];
}

// Get a guest by code
export async function getGuestByCode(code: string): Promise<GuestCode | null> {
  try {
    const { data, error } = await supabase
      .from('guest_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      // .single() throws PGRST116 when no rows found, this is expected
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching guest code:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching guest code:', err);
    return null;
  }
}

// Add a new guest code
export async function addGuestCode(code: string, name: string): Promise<GuestCode | null> {
  const { data, error } = await supabase
    .from('guest_codes')
    .insert([
      {
        code: code.toUpperCase(),
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding guest code:', error);
    return null;
  }

  return data;
}

// Update a guest code
export async function updateGuestCode(code: string, name: string): Promise<GuestCode | null> {
  const { data, error } = await supabase
    .from('guest_codes')
    .update({
      name,
      updated_at: new Date().toISOString(),
    })
    .eq('code', code.toUpperCase())
    .select()
    .single();

  if (error) {
    console.error('Error updating guest code:', error);
    return null;
  }

  return data;
}

// Delete a guest code
export async function deleteGuestCode(code: string): Promise<boolean> {
  const { error } = await supabase
    .from('guest_codes')
    .delete()
    .eq('code', code.toUpperCase());

  if (error) {
    console.error('Error deleting guest code:', error);
    return false;
  }

  return true;
}

// Fetch music data usage stats for admin dashboard
export async function getMusicUsageStats(): Promise<MusicUsageStats | null> {
  const { data, error } = await supabase.rpc('get_music_usage_stats');

  if (error) {
    const message = (error.message || '').toLowerCase();
    const details = (error.details || '').toLowerCase();
    const setupRequired =
      message.includes('get_music_usage_stats') ||
      details.includes('get_music_usage_stats') ||
      message.includes('function') ||
      message.includes('does not exist');

    if (!setupRequired) {
      console.error('Error fetching music usage stats:', error);
    }
    return null;
  }

  if (!data || typeof data !== 'object') return null;

  const payload = data as Partial<MusicUsageStats>;

  return {
    songs_count: Number(payload.songs_count || 0),
    song_votes_count: Number(payload.song_votes_count || 0),
    songs_table_bytes: Number(payload.songs_table_bytes || 0),
    song_votes_table_bytes: Number(payload.song_votes_table_bytes || 0),
    total_music_bytes: Number(payload.total_music_bytes || 0),
  };
}
