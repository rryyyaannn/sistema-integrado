// Prepara o banco de demo para uma sessao de teste. Uso: node scripts/preparar-demo.mjs
// Le credenciais do .env da raiz e usa service_role (ignora RLS).
//
// O seed grava a escala com `current_date`, entao ela "envelhece": no dia
// seguinte o dashboard (que filtra scheduled_date = hoje) mostra zero postos
// aguardando e o app do porteiro nao acha escala nenhuma. Este script:
//
//   1. move a escala do seed para hoje;
//   2. encerra como `abandoned` os plantoes que ficaram abertos de dias
//      anteriores — o mesmo desfecho que o cron do Sprint 4 vai dar.
//
// Nao apaga check-ins nem ocorrencias: o historico continua no painel.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of readFileSync(resolve(import.meta.dirname, '../.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}

const svc = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const d = new Date();
const hoje = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// --- 1. Escala do seed para hoje ---------------------------------------------
const { data: escala, error: errEscala } = await svc
  .from('schedules')
  .update({ scheduled_date: hoje })
  .neq('scheduled_date', hoje)
  .select('id, scheduled_date, post:posts(name), user:users(full_name, employee_code)');

if (errEscala) {
  console.error('FALHOU ao mover a escala:', errEscala.message);
  process.exit(1);
}
console.log(`\n== Escala movida para ${hoje} ==`);
console.log(escala.length ? `${escala.length} linha(s) atualizada(s)` : 'ja estava em hoje');
for (const s of escala) {
  console.log(`  ${s.post?.name} — ${s.user?.employee_code} ${s.user?.full_name}`);
}

// --- 2. Plantoes abertos de dias anteriores ----------------------------------
const { data: velhos, error: errVelhos } = await svc
  .from('shift_sessions')
  .update({ status: 'abandoned', closed_at: new Date().toISOString() })
  .eq('status', 'active')
  .lt('opened_at', `${hoje}T00:00:00Z`)
  .select('id, opened_at, post:posts(name), user:users(employee_code)');

if (errVelhos) {
  console.error('FALHOU ao encerrar plantoes velhos:', errVelhos.message);
  process.exit(1);
}
console.log('\n== Plantoes de dias anteriores encerrados como abandoned ==');
console.log(velhos.length ? `${velhos.length} plantao(oes)` : 'nenhum pendente');
for (const s of velhos) {
  console.log(`  ${s.post?.name} — ${s.user?.employee_code} (aberto em ${s.opened_at.slice(0, 10)})`);
}

// --- 3. Estado final ----------------------------------------------------------
const { count: ativos } = await svc
  .from('shift_sessions')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'active');
const { count: aguardando } = await svc
  .from('schedules')
  .select('id', { count: 'exact', head: true })
  .eq('scheduled_date', hoje);
const { count: abertas } = await svc
  .from('incidents')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'open');

console.log('\n== Como o painel vai abrir ==');
console.log(`  plantoes ativos:      ${ativos}`);
console.log(`  postos na escala hoje: ${aguardando}`);
console.log(`  ocorrencias abertas:  ${abertas}`);
