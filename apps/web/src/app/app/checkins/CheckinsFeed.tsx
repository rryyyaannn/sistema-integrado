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
    return (
      <div className="flex items-center gap-3 px-5 py-6 text-sm text-steel-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
        Carregando...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <p className="rounded-md bg-red-50 px-5 py-4 text-sm text-red-700">
        Erro ao carregar: {errorMsg}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-steel-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
        Nenhum check-in registrado ainda.
        <span className="text-xs text-steel-400">
          A tela atualiza automaticamente a cada {POLL_INTERVAL_MS / 1000}s.
        </span>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-steel-200/60">
      {items.map((row) => {
        const ts = new Date(row.server_received_at);
        const insideGeofence = row.geo_within_post === true;
        return (
          <li
            key={row.id}
            className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-steel-50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-brand-900">
                {row.user?.full_name ?? '(desconhecido)'}
              </p>
              <p className="mt-0.5 text-xs text-steel-600">{row.post?.name ?? '(sem posto)'}</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-wider text-steel-500">
                {PURPOSE_LABEL[row.purpose]} · {ts.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {row.unscheduled ? (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Fora da escala
                </span>
              ) : null}
              {row.geo_within_post === null ? (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-steel-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-steel-600">
                  Sem geo
                </span>
              ) : insideGeofence ? (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  No posto
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Fora do raio
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
