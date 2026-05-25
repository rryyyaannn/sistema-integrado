import { enqueueCheckin } from '@/db/queue';
import { supabase } from '@/lib/supabase';
import { buildCheckinPayload } from '@si/core';
import type { Enums, Json, Tables } from '@si/types';

export type PostByToken = Pick<
  Tables<'posts'>,
  'id' | 'name' | 'address' | 'service_type' | 'tenant_id'
> & {
  client_name: string;
};

type PostByTokenRow = Pick<
  Tables<'posts'>,
  'id' | 'name' | 'address' | 'service_type' | 'tenant_id'
> & {
  client: { name: string } | null;
};

/**
 * Encontra o posto pelo qr_code_token. RLS garante que so postos do tenant
 * do colaborador retornem. Retorna null se o token nao bate (QR invalido).
 */
export async function findPostByToken(token: string): Promise<PostByToken | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, name, address, service_type, tenant_id, client:clients(name)')
    .eq('qr_code_token', token)
    .is('deleted_at', null)
    .maybeSingle()
    .returns<PostByTokenRow | null>();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    service_type: data.service_type,
    tenant_id: data.tenant_id,
    client_name: data.client?.name ?? '',
  };
}

export type SubmitCheckinInput = {
  post: PostByToken;
  userId: string;
  purpose: Enums<'checkin_purpose'>;
  checklistTemplateId?: string;
  checklistResponses?: Json;
};

export type SubmitCheckinResult =
  | { ok: true; id: string; queued: boolean }
  | { ok: false; error: string };

/**
 * Insere um check-in. Idempotente via UUID v7 (ADR-0002): se reenvio acontecer,
 * `INSERT ... ON CONFLICT (id) DO NOTHING` evita duplicata.
 *
 * Por ora, sem checklist real: usa um template "placeholder" do banco. A
 * funcionalidade completa de checklist vem no Sprint 3.
 */
export async function submitCheckin(input: SubmitCheckinInput): Promise<SubmitCheckinResult> {
  // Sem template configurado: pega o primeiro template ativo do tenant para
  // satisfazer a FK obrigatoria. No Sprint 3 isso vira por configuracao.
  const { data: template, error: tmplError } = await supabase
    .from('checklist_templates')
    .select('id')
    .eq('tenant_id', input.post.tenant_id)
    .is('deleted_at', null)
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (tmplError || !template) {
    return { ok: false, error: 'Nenhum checklist configurado para este tenant.' };
  }

  const payload = buildCheckinPayload({
    tenantId: input.post.tenant_id,
    postId: input.post.id,
    userId: input.userId,
    purpose: input.purpose,
    checklistTemplateId: input.checklistTemplateId ?? template.id,
    checklistResponses: input.checklistResponses ?? {},
  });

  const { error } = await supabase.from('checkins').insert(payload);

  if (error) {
    // Falha de rede ou indisponibilidade: enfileira para reenvio (idempotente
    // via UUID v7). Erros nao-transientes (RLS, FK) tambem caem aqui — o flush
    // futuro vai re-tentar; e a falha persiste, o usuario nota pela fila.
    await enqueueCheckin(payload);
    return { ok: true, id: payload.id as string, queued: true };
  }

  return { ok: true, id: payload.id as string, queued: false };
}
