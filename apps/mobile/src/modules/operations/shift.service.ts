import { supabase } from '@/lib/supabase';
import type { Enums } from '@si/types';
import type { PostByToken } from './checkin.service';

/** Data local (America/Sao_Paulo ~ dispositivo) no formato YYYY-MM-DD. */
function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type ActivePlantao = {
  sessionId: string;
  openedAt: string;
  post: PostByToken;
};

type ActivePlantaoRow = {
  id: string;
  opened_at: string;
  post: {
    id: string;
    name: string;
    address: string | null;
    service_type: Enums<'post_service_type'>;
    tenant_id: string;
    latitude: number | null;
    longitude: number | null;
    geofence_radius_m: number;
    client: { name: string } | null;
  } | null;
};

const PLANTAO_POST_EMBED =
  'post:posts!inner(id, name, address, service_type, tenant_id, latitude, longitude, geofence_radius_m, client:clients(name))';

/**
 * Plantao ativo do porteiro (shift_sessions com status='active'). null quando
 * ele ainda nao assumiu nenhum posto. A trigger garante no maximo 1 por posto.
 */
export async function getActivePlantao(userId: string): Promise<ActivePlantao | null> {
  const { data, error } = await supabase
    .from('shift_sessions')
    .select(`id, opened_at, ${PLANTAO_POST_EMBED}`)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .returns<ActivePlantaoRow | null>();

  if (error || !data || !data.post) return null;

  const p = data.post;
  return {
    sessionId: data.id,
    openedAt: data.opened_at,
    post: {
      id: p.id,
      name: p.name,
      address: p.address,
      service_type: p.service_type,
      tenant_id: p.tenant_id,
      latitude: p.latitude,
      longitude: p.longitude,
      geofence_radius_m: p.geofence_radius_m,
      client_name: p.client?.name ?? '',
    },
  };
}

export type ScheduledPost = {
  scheduleId: string;
  shiftName: string | null;
  startTime: string;
  post: PostByToken;
};

type ScheduleRow = {
  id: string;
  post: {
    id: string;
    name: string;
    address: string | null;
    service_type: Enums<'post_service_type'>;
    tenant_id: string;
    latitude: number | null;
    longitude: number | null;
    geofence_radius_m: number;
    client: { name: string } | null;
  } | null;
  shift: { name: string | null; start_time: string } | null;
};

/**
 * Postos onde o porteiro esta escalado HOJE (planned/confirmed). Usado na home
 * para sugerir "Assumir posto" e no fluxo sem-QR. Pode ser vazio (troca de
 * ultima hora): o sistema nao trava — qualquer posto do tenant pode ser assumido.
 */
export async function getTodaySchedule(userId: string): Promise<ScheduledPost[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select(`id, ${PLANTAO_POST_EMBED}, shift:shifts!inner(name, start_time)`)
    .eq('user_id', userId)
    .eq('scheduled_date', todayLocal())
    .in('status', ['planned', 'confirmed'])
    .returns<ScheduleRow[]>();

  if (error || !data) return [];

  return data
    .filter(
      (row): row is ScheduleRow & { post: NonNullable<ScheduleRow['post']> } => row.post != null,
    )
    .map((row) => ({
      scheduleId: row.id,
      shiftName: row.shift?.name ?? null,
      startTime: row.shift?.start_time ?? '',
      post: {
        id: row.post.id,
        name: row.post.name,
        address: row.post.address,
        service_type: row.post.service_type,
        tenant_id: row.post.tenant_id,
        latitude: row.post.latitude,
        longitude: row.post.longitude,
        geofence_radius_m: row.post.geofence_radius_m,
        client_name: row.post.client?.name ?? '',
      },
    }));
}
