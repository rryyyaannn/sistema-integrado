import { createClient } from '@/lib/supabase/server';
import type { Enums } from '@si/types';

export type PostListItem = {
  id: string;
  name: string;
  service_type: Enums<'post_service_type'>;
  qr_code_token: string;
  active: boolean;
  address: string | null;
  client_name: string;
};

/**
 * Linha bruta do select com join — usada para tipar o .returns() quando o
 * inferer do supabase-js nao consegue mapear a sintaxe de embed.
 */
type PostRow = {
  id: string;
  name: string;
  service_type: Enums<'post_service_type'>;
  qr_code_token: string;
  active: boolean;
  address: string | null;
  client: { name: string };
};

export type PostDetail = {
  id: string;
  name: string;
  service_type: Enums<'post_service_type'>;
  qr_code_token: string;
  qr_code_rotated_at: string | null;
  active: boolean;
  address: string | null;
  client_name: string;
};

type PostDetailRow = {
  id: string;
  name: string;
  service_type: Enums<'post_service_type'>;
  qr_code_token: string;
  qr_code_rotated_at: string | null;
  active: boolean;
  address: string | null;
  client: { name: string };
};

/**
 * Busca um posto pelo id. Retorna null se nao existe ou se a RLS bloqueia.
 */
export async function getPost(id: string): Promise<PostDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, name, service_type, qr_code_token, qr_code_rotated_at, active, address, client:clients!inner(name)',
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
    .returns<PostDetailRow | null>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    service_type: data.service_type,
    qr_code_token: data.qr_code_token,
    qr_code_rotated_at: data.qr_code_rotated_at,
    active: data.active,
    address: data.address,
    client_name: data.client.name,
  };
}

/**
 * Lista postos do tenant logado. RLS filtra por tenant_id e exclui soft-deleted.
 */
export async function listPosts(): Promise<PostListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('id, name, service_type, qr_code_token, active, address, client:clients!inner(name)')
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .returns<PostRow[]>();

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    service_type: row.service_type,
    qr_code_token: row.qr_code_token,
    active: row.active,
    address: row.address,
    client_name: row.client.name,
  }));
}
