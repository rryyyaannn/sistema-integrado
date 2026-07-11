'use client';

import { createClient } from '@/lib/supabase/client';
import type { Enums } from '@si/types';
import { useEffect, useState } from 'react';

type ActiveSessionRow = {
  id: string;
  opened_at: string;
  post: { id: string; name: string; client: { name: string } | null } | null;
  user: { full_name: string } | null;
};

type OpenIncidentRow = {
  id: string;
  title: string;
  severity: Enums<'incident_severity'>;
  is_panic: boolean;
  server_received_at: string;
  post: { name: string } | null;
  user: { full_name: string } | null;
};

type ScheduleRow = {
  post: { id: string; name: string; client: { name: string } | null } | null;
  shift: { name: string | null; start_time: string } | null;
  user: { full_name: string } | null;
};

type Snapshot = {
  active: ActiveSessionRow[];
  incidents: OpenIncidentRow[];
  awaiting: {
    postId: string;
    postName: string;
    clientName: string;
    userName: string;
    shiftName: string | null;
    startTime: string;
  }[];
};

const POLL_MS = 5000;

const SEVERITY_STYLE: Record<Enums<'incident_severity'>, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-orange-50 text-orange-800 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

const SEVERITY_LABEL: Record<Enums<'incident_severity'>, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
};

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function MonitorDashboard() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const fetchAll = async () => {
      const [sessionsRes, incidentsRes, schedulesRes] = await Promise.all([
        supabase
          .from('shift_sessions')
          .select(
            'id, opened_at, post:posts!inner(id, name, client:clients(name)), user:users!inner(full_name)',
          )
          .eq('status', 'active')
          .order('opened_at', { ascending: true })
          .returns<ActiveSessionRow[]>(),
        supabase
          .from('incidents')
          .select(
            'id, title, severity, is_panic, server_received_at, post:posts!inner(name), user:users!inner(full_name)',
          )
          .eq('status', 'open')
          .order('is_panic', { ascending: false })
          .order('server_received_at', { ascending: false })
          .limit(50)
          .returns<OpenIncidentRow[]>(),
        supabase
          .from('schedules')
          .select(
            'post:posts!inner(id, name, client:clients(name)), shift:shifts!inner(name, start_time), user:users!inner(full_name)',
          )
          .eq('scheduled_date', todayLocal())
          .in('status', ['planned', 'confirmed'])
          .returns<ScheduleRow[]>(),
      ]);

      if (!active) return;

      const err = sessionsRes.error || incidentsRes.error || schedulesRes.error;
      if (err) {
        setStatus('error');
        setErrorMsg(err.message);
        return;
      }

      const activeSessions = sessionsRes.data ?? [];
      const activePostIds = new Set(
        activeSessions.map((s) => s.post?.id).filter((id): id is string => !!id),
      );
      const awaiting = (schedulesRes.data ?? []).flatMap((row) => {
        if (!row.post || activePostIds.has(row.post.id)) return [];
        return [
          {
            postId: row.post.id,
            postName: row.post.name,
            clientName: row.post.client?.name ?? '',
            userName: row.user?.full_name ?? '(sem colaborador)',
            shiftName: row.shift?.name ?? null,
            startTime: row.shift?.start_time ?? '',
          },
        ];
      });

      setSnap({ active: activeSessions, incidents: incidentsRes.data ?? [], awaiting });
      setStatus('ready');
    };

    void fetchAll();
    const interval = setInterval(fetchAll, POLL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 py-10 text-sm text-steel-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
        Carregando painel...
      </div>
    );
  }

  if (status === 'error' || !snap) {
    return (
      <p className="rounded-md bg-red-50 px-5 py-4 text-sm text-red-700">
        Erro ao carregar: {errorMsg ?? 'desconhecido'}
      </p>
    );
  }

  const panics = snap.incidents.filter((i) => i.is_panic);

  return (
    <div className="flex flex-col gap-6">
      {/* Alerta de panico */}
      {panics.length > 0 ? (
        <div className="animate-pulse rounded-lg border-2 border-red-500 bg-red-600 px-5 py-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-100">
            Emergencia
          </p>
          <p className="mt-1 text-lg font-bold">
            {panics.length} botao(oes) de panico acionado(s) — resposta imediata
          </p>
          <p className="mt-1 text-sm text-red-100">
            {panics.map((p) => `${p.post?.name ?? '?'} (${p.user?.full_name ?? '?'})`).join(' · ')}
          </p>
        </div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Plantoes ativos" value={snap.active.length} tone="ok" />
        <StatTile
          label="Postos aguardando"
          value={snap.awaiting.length}
          tone={snap.awaiting.length ? 'warn' : 'muted'}
        />
        <StatTile
          label="Ocorrencias abertas"
          value={snap.incidents.length}
          tone={snap.incidents.length ? 'warn' : 'muted'}
        />
        <StatTile label="Panicos" value={panics.length} tone={panics.length ? 'danger' : 'muted'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plantoes ativos */}
        <Section title="Plantoes ativos" live>
          {snap.active.length === 0 ? (
            <Empty>Nenhum plantao ativo agora.</Empty>
          ) : (
            <ul className="divide-y divide-steel-200/60">
              {snap.active.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">
                      {s.post?.name ?? '(sem posto)'}
                    </p>
                    <p className="mt-0.5 text-xs text-steel-600">
                      {s.user?.full_name ?? '(desconhecido)'} · {s.post?.client?.name ?? ''}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    desde {timeOf(s.opened_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Postos aguardando */}
        <Section title="Postos aguardando check-in">
          {snap.awaiting.length === 0 ? (
            <Empty>Todos os postos escalados assumiram.</Empty>
          ) : (
            <ul className="divide-y divide-steel-200/60">
              {snap.awaiting.map((a) => (
                <li key={a.postId} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">{a.postName}</p>
                    <p className="mt-0.5 text-xs text-steel-600">
                      {a.userName}
                      {a.shiftName ? ` · ${a.shiftName}` : ''}
                      {a.startTime ? ` · inicio ${a.startTime.slice(0, 5)}` : ''}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                    aguardando
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Ocorrencias abertas */}
      <Section title="Ocorrencias abertas" live>
        {snap.incidents.length === 0 ? (
          <Empty>Nenhuma ocorrencia aberta.</Empty>
        ) : (
          <ul className="divide-y divide-steel-200/60">
            {snap.incidents.map((i) => (
              <li
                key={i.id}
                className={`flex items-start justify-between gap-4 px-5 py-3.5 ${i.is_panic ? 'bg-red-50/60' : ''}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-900">
                    {i.is_panic ? '🚨 ' : ''}
                    {i.title}
                  </p>
                  <p className="mt-0.5 text-xs text-steel-600">
                    {i.post?.name ?? '(sem posto)'} · {i.user?.full_name ?? '(desconhecido)'} ·{' '}
                    {new Date(i.server_received_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${SEVERITY_STYLE[i.severity]}`}
                >
                  {SEVERITY_LABEL[i.severity]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'ok' | 'warn' | 'danger' | 'muted';
}) {
  const toneCls = {
    ok: 'text-emerald-700',
    warn: 'text-amber-700',
    danger: 'text-red-700',
    muted: 'text-steel-400',
  }[tone];
  return (
    <div className="rounded-lg border border-steel-200 bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-steel-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${toneCls}`}>{value}</p>
    </div>
  );
}

function Section({
  title,
  live,
  children,
}: { title: string; live?: boolean; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-steel-200 bg-white">
      <div className="flex items-center justify-between border-b border-steel-200 px-5 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-brand-900">{title}</h2>
        {live ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Ao vivo
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-8 text-center text-sm text-steel-500">{children}</p>;
}
