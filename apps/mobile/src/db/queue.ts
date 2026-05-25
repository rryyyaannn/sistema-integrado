import { supabase } from '@/lib/supabase';
import type { InsertDto } from '@si/types';
import { storage } from './storage';

const PREFIX = 'pending:checkin:';

type PendingCheckin = {
  id: string;
  payload: InsertDto<'checkins'>;
  enqueuedAt: string;
};

/**
 * Adiciona um check-in pendente na fila local.
 * Chave: pending:checkin:<id>. Idempotencia via UUID v7 (ADR-0002).
 */
export async function enqueueCheckin(payload: InsertDto<'checkins'>): Promise<void> {
  const item: PendingCheckin = {
    id: payload.id as string,
    payload,
    enqueuedAt: new Date().toISOString(),
  };
  await storage.setJson(PREFIX + item.id, item);
}

/** Conta quantos check-ins estao pendentes para envio. */
export async function pendingCheckinsCount(): Promise<number> {
  const keys = await storage.keys(PREFIX);
  return keys.length;
}

/**
 * Tenta enviar todos os check-ins pendentes. Retorna { sent, failed } com a
 * contagem do que conseguiu drenar. Itens que falham continuam na fila.
 */
export async function flushPendingCheckins(): Promise<{ sent: number; failed: number }> {
  const keys = await storage.keys(PREFIX);
  let sent = 0;
  let failed = 0;

  for (const key of keys) {
    const item = await storage.getJson<PendingCheckin>(key);
    if (!item) {
      await storage.remove(key);
      continue;
    }
    const { error } = await supabase.from('checkins').insert(item.payload);
    if (error) {
      failed += 1;
      continue;
    }
    await storage.remove(key);
    sent += 1;
  }

  return { sent, failed };
}
