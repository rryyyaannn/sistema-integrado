// Verificacao pos-deploy do banco (cloud). Uso: node scripts/verify-db.mjs
// Le credenciais do .env da raiz. Usa service_role (ignora RLS) para checar
// schema/dados e testar a trigger de plantao ponta a ponta; um cliente anon
// separado prova que a RLS esta ativa. Limpa os dados de teste no fim.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// --- .env parser minimo -------------------------------------------------------
const env = {};
for (const line of readFileSync(resolve(import.meta.dirname, '../.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const URL = env.SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.SUPABASE_ANON_KEY;

const svc = createClient(URL, SERVICE, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

const TENANT = '11111111-1111-7111-8111-111111111111';
const POST = 'b1111111-0000-7000-8000-000000000005'; // Vista Verde (posto de teste)
const USER = 'a1111111-0000-7000-8000-000000000003'; // Carlos Porteiro

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  cond ? pass++ : fail++;
};

// --- 1. Contagens do seed / existencia das tabelas ----------------------------
console.log('\n== Schema + seed ==');
const counts = {};
for (const t of [
  'tenants', 'users', 'clients', 'posts', 'shifts', 'schedules',
  'checklist_templates', 'post_checklist_assignments', 'incident_categories',
  'checkins', 'incidents', 'shift_sessions', 'shift_start_expectations',
  'periodic_checkin_expectations', 'media_files', 'audit_log', 'notifications',
]) {
  const { count, error } = await svc.from(t).select('*', { count: 'exact', head: true });
  counts[t] = error ? `ERRO(${error.message})` : count;
  ok(`tabela ${t} acessivel`, !error, error ? error.message : `${count} linhas`);
}
ok('seed: 1 tenant', counts.tenants === 1);
ok('seed: 5 usuarios', counts.users === 5);
ok('seed: 5 postos', counts.posts === 5);
ok('seed: 8 turnos', counts.shifts === 8);
ok('seed: 5 categorias de ocorrencia', counts.incident_categories === 5);

// --- 2. RLS ativa (anon nao le nada) ------------------------------------------
console.log('\n== RLS ==');
const { count: anonUsers } = await anon.from('users').select('*', { count: 'exact', head: true });
ok('anon NAO le users (RLS bloqueia)', (anonUsers ?? 0) === 0, `anon viu ${anonUsers ?? 0}`);
ok('service_role le users (bypassa RLS)', counts.users === 5);

// --- 3. Ciclo de vida do plantao (trigger sync_shift_session) -----------------
console.log('\n== Trigger de plantao ==');
const created = { checkins: [], incidents: [] };
try {
  // entry -> abre plantao
  const { data: entry, error: e1 } = await svc.from('checkins')
    .insert({ tenant_id: TENANT, post_id: POST, user_id: USER, purpose: 'entry' })
    .select().single();
  if (e1) throw new Error('insert entry: ' + e1.message);
  created.checkins.push(entry.id);
  ok('entry: validation_method default = button', entry.validation_method === 'button');
  ok('entry: shift_session_id preenchido pela trigger', !!entry.shift_session_id);

  const sessionId = entry.shift_session_id;
  const { data: sess1 } = await svc.from('shift_sessions').select('*').eq('id', sessionId).single();
  ok('entry: plantao criado com status active', sess1?.status === 'active');
  ok('entry: opened_by_checkin_id aponta pro check-in', sess1?.opened_by_checkin_id === entry.id);

  // periodic -> mesmo plantao
  const { data: per, error: e2 } = await svc.from('checkins')
    .insert({ tenant_id: TENANT, post_id: POST, user_id: USER, purpose: 'periodic' })
    .select().single();
  if (e2) throw new Error('insert periodic: ' + e2.message);
  created.checkins.push(per.id);
  ok('periodic: vinculado ao MESMO plantao', per.shift_session_id === sessionId);

  // exit -> encerra plantao
  const { data: ex, error: e3 } = await svc.from('checkins')
    .insert({ tenant_id: TENANT, post_id: POST, user_id: USER, purpose: 'exit' })
    .select().single();
  if (e3) throw new Error('insert exit: ' + e3.message);
  created.checkins.push(ex.id);
  ok('exit: vinculado ao mesmo plantao', ex.shift_session_id === sessionId);
  const { data: sess2 } = await svc.from('shift_sessions').select('*').eq('id', sessionId).single();
  ok('exit: plantao encerrado (closed)', sess2?.status === 'closed');
  ok('exit: closed_by_checkin_id aponta pro check-in de saida', sess2?.closed_by_checkin_id === ex.id);

  // panico reusa incidents
  const { data: panic, error: e4 } = await svc.from('incidents')
    .insert({ tenant_id: TENANT, post_id: POST, user_id: USER, title: 'PANICO (teste)', severity: 'critical', is_panic: true, status: 'open' })
    .select().single();
  if (e4) throw new Error('insert panic: ' + e4.message);
  created.incidents.push(panic.id);
  ok('panico: incident com is_panic=true criado', panic.is_panic === true && panic.severity === 'critical');
} catch (err) {
  ok('ciclo de plantao completou', false, err.message);
} finally {
  // --- limpeza (service_role ignora o append-only da RLS) ---
  if (created.incidents.length) await svc.from('incidents').delete().in('id', created.incidents);
  if (created.checkins.length) await svc.from('checkins').delete().in('id', created.checkins);
  await svc.from('shift_sessions').delete().eq('post_id', POST);
  console.log('(dados de teste removidos)');
}

console.log(`\n== RESULTADO: ${pass} PASS / ${fail} FAIL ==`);
process.exit(fail ? 1 : 0);
