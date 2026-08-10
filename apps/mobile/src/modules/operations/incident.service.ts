import type { CapturedGeo } from '@/lib/location';
import { supabase } from '@/lib/supabase';
import { generateUuidV7 } from '@si/core';
import type { Enums, InsertDto } from '@si/types';

export type IncidentCategory = {
  id: string;
  name: string;
  severity_default: Enums<'incident_severity'>;
  notify_supervisor: boolean;
};

/** Categorias de ocorrencia configuradas para o tenant (para o formulario). */
export async function listIncidentCategories(tenantId: string): Promise<IncidentCategory[]> {
  const { data, error } = await supabase
    .from('incident_categories')
    .select('id, name, severity_default, notify_supervisor')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data;
}

export type SubmitIncidentInput = {
  tenantId: string;
  postId: string;
  userId: string;
  title: string;
  description?: string | null;
  severity: Enums<'incident_severity'>;
  incidentCategoryId?: string | null;
  isPanic?: boolean;
  shiftSessionId?: string | null;
  geo?: CapturedGeo | null;
};

export type SubmitIncidentResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Registra uma ocorrencia. O botao de panico reusa esta tabela com is_panic=true
 * e severity='critical' (ADR-0009): o alerta e disparado pela Edge Function que
 * observa incidents(is_panic, status='open'); o protocolo de resposta usa
 * incident_status_changes. Diferente do check-in, ocorrencia nao e enfileirada
 * offline no MVP — falha de rede retorna erro para o porteiro tentar de novo.
 */
export async function submitIncident(input: SubmitIncidentInput): Promise<SubmitIncidentResult> {
  const payload: InsertDto<'incidents'> = {
    id: generateUuidV7(),
    tenant_id: input.tenantId,
    post_id: input.postId,
    user_id: input.userId,
    incident_category_id: input.incidentCategoryId ?? null,
    title: input.title,
    description: input.description ?? null,
    severity: input.severity,
    is_panic: input.isPanic ?? false,
    shift_session_id: input.shiftSessionId ?? null,
    latitude: input.geo?.latitude ?? null,
    longitude: input.geo?.longitude ?? null,
    status: 'open',
    client_created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('incidents').insert(payload);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, id: payload.id as string };
}
