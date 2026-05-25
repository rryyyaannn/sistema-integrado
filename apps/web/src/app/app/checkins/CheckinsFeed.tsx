'use client';

import { createClient } from '@/lib/supabase/client';
import type { Enums } from '@si/types';
import { useEffect, useState } from 'react';

type CheckinRow = {
  id: string;
  purpose: Enums<'checkin_purpose'>;
  server_received_at: string;
  client_created_at: string;
  geo_within_post: boolean | null;
  unscheduled: boolean;
  post: { name: string } | null;
  user: { full_name: string } | null;
};

const PURPOSE_LABEL: Record<Enums<'checkin_purpose'>, string> = {
  entry: 'Entrada',
  periodic: 'Periodico',
  exit: 'Saida',
};

const POLL_INTERVAL_MS = 5000;

export function CheckinsFeed() {
  const [items, setItems] = useState<CheckinRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select(
          'id, purpose, server_received_at, client_created_at, geo_within_post, unscheduled, post:posts!inner(name), user:users!inner(full_name)',
        )
        .order('server_received_at', { ascending: false })
        .limit(50)
        .returns<CheckinRow[]>();

      if (!active) {
        return;
      }
      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }
      setItems(data ?? []);
      setStatus('ready');
    };

    void fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (status === 'loading') {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }

  if (status === 'error') {
    return <p className="text-sm text-red-600">Erro ao carregar: {errorMsg}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Nenhum check-in registrado ainda. Quando o app de campo enviar um check-in, ele aparece aqui
        em ate {POLL_INTERVAL_MS / 1000}s.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {items.map((row) => {
        const ts = new Date(row.server_received_at);
        const insideGeofence = row.geo_within_post === true;
        return (
          <li key={row.id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {row.user?.full_name ?? '(desconhecido)'} —{' '}
                <span className="text-neutral-600">{row.post?.name ?? '(sem posto)'}</span>
              </p>
              <p className="text-xs text-neutral-500">
                {PURPOSE_LABEL[row.purpose]} · {ts.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {row.unscheduled ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  fora da escala
                </span>
              ) : null}
              {row.geo_within_post === null ? (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  sem geo
                </span>
              ) : insideGeofence ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  no posto
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  fora do raio
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
