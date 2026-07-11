// Testa o fluxo de login ponta a ponta contra o cloud, provando que o auth hook
// injeta tenant_id/user_role no JWT. Uso: node scripts/verify-login.mjs
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of readFileSync(resolve(import.meta.dirname, '../.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const decode = (jwt) => JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'));

let pass = 0, fail = 0;
const ok = (n, c, e = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${e ? ' — ' + e : ''}`); c ? pass++ : fail++; };

async function login(label, email, password, expectedRole) {
  const c = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) { ok(`login ${label}`, false, error.message); return; }
  ok(`login ${label}`, true, email);
  const claims = decode(data.session.access_token);
  ok(`  claim tenant_id presente (${label})`, !!claims.tenant_id, claims.tenant_id ?? 'AUSENTE');
  ok(`  claim user_role = ${expectedRole} (${label})`, claims.user_role === expectedRole, claims.user_role ?? 'AUSENTE');
  await c.auth.signOut();
}

console.log('== Login + claims do JWT (auth hook) ==');
await login('admin', 'admin@portaria-modelo.com.br', 'portaria123', 'admin');
await login('supervisor', 'supervisor@portaria-modelo.com.br', 'portaria123', 'supervisor');
// Porteiro: matricula P001 + PIN 1234 -> email sintetico (ADR-0005)
await login('porteiro P001', 'colaborador-p001@portaria-modelo.local', '1234', 'field_worker');

console.log(`\n== RESULTADO: ${pass} PASS / ${fail} FAIL ==`);
process.exit(fail ? 1 : 0);
