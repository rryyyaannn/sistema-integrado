/**
 * Acesso centralizado as variaveis de ambiente publicas do app web.
 *
 * Nao lanca erro na importacao de proposito: se lancasse, o `next build` no CI
 * (que roda sem .env) quebraria. Quem consome deve checar isSupabaseConfigured().
 */

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;

export function isSupabaseConfigured(): boolean {
  return env.NEXT_PUBLIC_SUPABASE_URL !== '' && env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '';
}
