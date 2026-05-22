import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@si/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True quando as variaveis de ambiente do Supabase estao preenchidas. */
export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
}

/**
 * Cliente Supabase do app de campo. A sessao e persistida no AsyncStorage.
 *
 * Fallback de placeholder: sem ele, createClient lancaria erro ja na
 * importacao quando o .env ainda nao foi preenchido — quem consome deve
 * checar isSupabaseConfigured() antes de chamar a API.
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
