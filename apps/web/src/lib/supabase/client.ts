import { env } from '@/lib/env';
import type { Database } from '@si/types';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para uso em Client Components (browser).
 * Tipado com o schema gerado (@si/types).
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
