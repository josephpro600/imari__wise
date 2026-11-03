import { supabase } from '@/lib/supabase';
import type { Currency, Language, Profile } from '@/types/finance';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, language, currency')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data as Profile | null;
}

export interface ProfilePatch {
  full_name?: string;
  language?: Language;
  currency?: Currency;
}

export async function saveProfile(userId: string, patch: ProfilePatch): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('user_id, full_name, language, currency')
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as Profile;
}
