/**
 * Constroi o email sintetico usado para autenticar colaboradores de campo
 * no Supabase Auth (ver ADR-0005). O Supabase exige email, mas o colaborador
 * de portaria nao tem corporativo — entao montamos um deterministico a partir
 * da matricula + slug do tenant.
 *
 * Forma: `colaborador-{matricula}@{tenantSlug}.local`
 *  - matricula em minusculas (compativel com email RFC)
 *  - tenantSlug deve ser kebab-case e nao conter "@" nem espacos
 *  - dominio `.local` deixa explicito que e sintetico
 *
 * @example
 *   buildSyntheticEmail({ matricula: 'P001', tenantSlug: 'portaria-modelo' })
 *   // -> "colaborador-p001@portaria-modelo.local"
 */
export function buildSyntheticEmail({
  matricula,
  tenantSlug,
}: {
  matricula: string;
  tenantSlug: string;
}): string {
  const safeMatricula = matricula.trim().toLowerCase();
  const safeTenant = tenantSlug.trim().toLowerCase();
  return `colaborador-${safeMatricula}@${safeTenant}.local`;
}

/**
 * Normaliza uma matricula digitada pelo colaborador para o formato canonico
 * usado no email sintetico e no campo employee_code da tabela users.
 *
 * Aceita digitos e letras; remove espacos. Retorna upper-case (o seed usa P001).
 */
export function parseMatricula(input: string): string {
  return input.trim().replace(/\s+/g, '').toUpperCase();
}
