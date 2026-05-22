/**
 * Regenera packages/types/src/database.ts a partir do schema do Supabase.
 *
 * Uso:  pnpm gen:types
 *
 * Por padrao gera a partir do banco LOCAL (requer `supabase start` rodando).
 * Para gerar a partir do projeto na nuvem (linkado via `supabase link`):
 *   SUPABASE_TARGET=linked pnpm gen:types
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OUTPUT = resolve(import.meta.dirname, '../packages/types/src/database.ts');
const target = process.env.SUPABASE_TARGET === 'linked' ? '--linked' : '--local';

const HEADER = `/**
 * GERADO AUTOMATICAMENTE A PARTIR DO SCHEMA DO SUPABASE — NAO EDITAR A MAO.
 *
 * Regenerar com:  pnpm gen:types
 */

`;

console.log(`Gerando tipos TypeScript do Supabase (${target})...`);

const types = execFileSync(
  'supabase',
  ['gen', 'types', 'typescript', target, '--schema', 'public'],
  // shell: true para resolver shims .cmd do pnpm no Windows.
  { encoding: 'utf8', shell: true },
);

writeFileSync(OUTPUT, HEADER + types, 'utf8');
console.log(`Tipos atualizados em ${OUTPUT}`);
