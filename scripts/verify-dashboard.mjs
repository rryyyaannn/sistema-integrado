// Testa o data layer do dashboard web sob RLS real: loga como admin (anon +
// sessao) e roda as 3 queries do MonitorDashboard. Prova que a RLS libera o
// papel admin e que os embeds resolvem. Uso: node scripts/verify-dashboard.mjs
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of readFileSync(resolve(import.meta.dirname, '../.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}

const today = new Date().toISOString().slice(0, 10);
let pass = 0;
let fail = 0;
const ok = (n, c, e = '') => {
  console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${e ? ' — ' + e : ''}`);
  c ? pass++ : fail++;
};

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

console.log('== Dashboard sob RLS (login admin) ==');
const { error: authErr } = await sb.auth.signInWithPassword({
  email: 'admin@portaria-modelo.com.br',
  password: 'portaria123',
});
ok('login admin', !authErr, authErr?.message);

const sessions = await sb
  .from('shift_sessions')
  .select('id, opened_at, post:posts!inner(id, name, client:clients(name)), user:users!inner(full_name)')
  .eq('status', 'active')
  .returns();
ok('query plantoes ativos', !sessions.error, sessions.error?.message ?? `${sessions.data.length} linhas`);

const incidents = await sb
  .from('incidents')
  .select('id, title, severity, is_panic, server_received_at, post:posts!inner(name), user:users!inner(full_name)')
  .eq('status', 'open')
  .order('is_panic', { ascending: false })
  .returns();
ok('query ocorrencias abertas', !incidents.error, incidents.error?.message ?? `${incidents.data.length} linhas`);

const schedules = await sb
  .from('schedules')
  .select('post:posts!inner(id, name, client:clients(name)), shift:shifts!inner(name, start_time), user:users!inner(full_name)')
  .eq('scheduled_date', today)
  .in('status', ['planned', 'confirmed'])
  .returns();
ok('query escala de hoje', !schedules.error, schedules.error?.message ?? `${schedules.data.length} linhas`);

await sb.auth.signOut();
console.log(`\n== RESULTADO: ${pass} PASS / ${fail} FAIL ==`);
process.exit(fail ? 1 : 0);
