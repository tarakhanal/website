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
  const { data, error } = await supabase
    .from('guest_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    console.error('Error fetching guest code:', error);
    return null;
  }

  return data;
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
