import { env } from '@/lib/env';
import type { Database } from '@si/types';
import { type CookieMethodsServer, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para uso em Server Components, Route Handlers e Server
 * Actions. Le e escreve a sessao via cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Chamado de um Server Component, que nao pode escrever cookies.
        // O middleware (Sprint 2) cuidara do refresh da sessao.
      }
    },
  };

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: cookieMethods },
  );
}
