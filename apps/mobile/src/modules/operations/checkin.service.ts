import { enqueueCheckin } from '@/db/queue';
import type { CapturedGeo } from '@/lib/location';
import { supabase } from '@/lib/supabase';
import { buildCheckinPayload } from '@si/core';
import type { Enums, Json, Tables } from '@si/types';

/** Posto com as coordenadas necessarias para validar o geofence no check-in. */
export type PostByToken = Pick<
  Tables<'posts'>,
  | 'id'
  | 'name'
  | 'address'
  | 'service_type'
  | 'tenant_id'
  | 'latitude'
  | 'longitude'
  | 'geofence_radius_m'
> & {
  client_name: string;
};

type PostRow = Pick<
  Tables<'posts'>,
  | 'id'
  | 'name'
  | 'address'
  | 'service_type'
  | 'tenant_id'
  | 'latitude'
  | 'longitude'
  | 'geofence_radius_m'
> & {
  client: { name: string } | null;
};

const POST_COLUMNS =
  'id, name, address, service_type, tenant_id, latitude, longitude, geofence_radius_m, client:clients(name)';

function mapPost(row: PostRow): PostByToken {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    service_type: row.service_type,
    tenant_id: row.tenant_id,
    latitude: row.latitude,
    longitude: row.longitude,
    geofence_radius_m: row.geofence_radius_m,
    client_name: row.client?.name ?? '',
  };
}

/**
 * Encontra o posto pelo qr_code_token. RLS garante que so postos do tenant do
 * colaborador retornem. null se o token nao bate (QR invalido / de outro posto).
 */
export async function findPostByToken(token: string): Promise<PostByToken | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    .eq('qr_code_token', token)
    .is('deleted_at', null)
    .maybeSingle()
    .returns<PostRow | null>();

  if (error || !data) return null;
  return mapPost(data);
}

/** Busca um posto pelo id (fluxo "sem QR": posto vem da escala ou de uma lista). */
export async function getPostById(id: string): Promise<PostByToken | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
    .returns<PostRow | null>();

  if (error || !data) return null;
  return mapPost(data);
}

/** Lista postos ativos do tenant — para escolher manualmente quando nao ha QR. */
export async function listActivePosts(): Promise<PostByToken[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_COLUMNS)
    .eq('active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .returns<PostRow[]>();

  if (error || !data) return [];
  return data.map(mapPost);
}

/**
 * Resolve o template de checklist para (posto, proposito) via
 * post_checklist_assignments; se nao houver, cai no primeiro template ativo do
 * tenant. Retorna null se nada existir — o check-in ainda e registrado sem
 * template (checklist_template_id e nullable). Best-effort: offline retorna null.
 */
async function resolveChecklistTemplateId(
  post: PostByToken,
  purpose: Enums<'checkin_purpose'>,
): Promise<string | null> {
  const { data: assignment } = await supabase
    .from('post_checklist_assignments')
    .select('checklist_template_id')
    .eq('post_id', post.id)
    .eq('purpose', purpose)
    .limit(1)
    .maybeSingle();
  if (assignment?.checklist_template_id) return assignment.checklist_template_id;

  const { data: template } = await supabase
    .from('checklist_templates')
    .select('id')
    .eq('tenant_id', post.tenant_id)
    .is('deleted_at', null)
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return template?.id ?? null;
}

export type SubmitCheckinInput = {
  post: PostByToken;
  userId: string;
  purpose: Enums<'checkin_purpose'>;
  /** 'qr' quando leu o QR do posto; 'button' (default) = sem QR. */
  validationMethod?: Enums<'checkin_validation_method'>;
  qrTokenUsed?: string | null;
  geo?: CapturedGeo | null;
  checklistResponses?: Json;
};

export type SubmitCheckinResult =
  | { ok: true; id: string; queued: boolean }
  | { ok: false; error: string };

/**
 * Insere um check-in. Idempotente via UUID v7 (ADR-0002): reenvio faz
 * ON CONFLICT (id) DO NOTHING e nao duplica. A trigger sync_shift_session abre/
 * fecha o plantao a partir do purpose (entry/periodic/exit). Se o INSERT falha
 * (rede), enfileira para reenvio automatico.
 */
export async function submitCheckin(input: SubmitCheckinInput): Promise<SubmitCheckinResult> {
  const templateId = await resolveChecklistTemplateId(input.post, input.purpose);

  const payload = buildCheckinPayload({
    tenantId: input.post.tenant_id,
    postId: input.post.id,
    userId: input.userId,
    purpose: input.purpose,
    checklistTemplateId: templateId,
    checklistResponses: input.checklistResponses ?? {},
    validationMethod: input.validationMethod ?? 'button',
    qrTokenUsed: input.qrTokenUsed ?? null,
    latitude: input.geo?.latitude ?? null,
    longitude: input.geo?.longitude ?? null,
    geoAccuracyM: input.geo?.accuracyM ?? null,
    geoWithinPost: input.geo?.withinPost ?? null,
  });

  const { error } = await supabase.from('checkins').insert(payload);

  if (error) {
    await enqueueCheckin(payload);
    return { ok: true, id: payload.id as string, queued: true };
  }

  return { ok: true, id: payload.id as string, queued: false };
}
