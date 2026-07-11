-- =============================================================================
-- Sistema Integrado — Migration 10: Rework "Supervisor Eletronico"
-- -----------------------------------------------------------------------------
-- Delta ADITIVO da reducao de escopo da Fase 1.1 (ver docs/adr/0007). O schema
-- das migrations 01-09 ja cobre ~85% do escopo enxuto; esta migration acrescenta
-- apenas o que faltava para o fluxo do porteiro:
--
--   1. shift_sessions  — o PLANTAO como entidade (abre no check-in de entrada,
--      fecha no de saida; cron encerra plantao esquecido como 'abandoned').
--   2. checkins        — validation_method (QR / botao "SEM QR") + shift_session_id.
--   3. incidents       — is_panic (botao de panico reusa incidents; protocolo de
--      resposta sai de graca via incident_status_changes) + shift_session_id.
--   4. Regua de escalonamento — shift_start_expectations (nao assumiu o posto) e
--      colunas de nivel de escalonamento em periodic_checkin_expectations.
--
-- Decisoes desta fase (ADR-0007): plantao como entidade = SIM; panico = reusar
-- incidents com flag; canal de alerta no MVP = so push (Expo).
--
-- NAO incluido de proposito (adiado): post_evaluations (avaliacao semanal/mensal,
-- secundario) e validacao semantica por IA (modulo 8, fora do Cenario A).
-- =============================================================================

-- =============================================================================
-- 1. shift_sessions — o plantao como entidade de primeira classe
-- =============================================================================
create type public.shift_session_status as enum ('active', 'closed', 'abandoned');

comment on type public.shift_session_status is
  'active: plantao em andamento. closed: encerrado por check-out. '
  'abandoned: encerrado por cron/entrada nova sem check-out do porteiro anterior.';

-- Um plantao amarra entrada -> check-ins periodicos -> saida de um porteiro num
-- posto. Nao e append-only puro: tem ciclo de vida (active -> closed/abandoned),
-- gerido exclusivamente pela trigger sync_shift_session e por service_role (cron).
-- opened_by/closed_by_checkin_id sao uuid SEM FK de proposito: a trigger roda em
-- BEFORE INSERT do check-in, quando a linha do check-in ainda nao existe — uma FK
-- falharia. A integridade e garantida pela propria trigger (usa new.id).
create table public.shift_sessions (
  id                   uuid primary key default public.uuid_generate_v7(),
  tenant_id            uuid not null references public.tenants (id),
  post_id              uuid not null references public.posts (id),
  user_id              uuid not null references public.users (id),
  schedule_id          uuid references public.schedules (id),
  status               public.shift_session_status not null default 'active',
  opened_at            timestamptz not null default now(),
  opened_by_checkin_id uuid,
  closed_at            timestamptz,
  closed_by_checkin_id uuid,
  created_at           timestamptz not null default now()
);

comment on table public.shift_sessions is
  'Plantao. Aberto pela entrada, fechado pela saida (ou abandonado pelo cron). '
  'Alimenta o dashboard (postos ocupados/aguardando) e a passagem de servico.';

-- No maximo UM plantao ativo por posto (um porteiro de cada vez).
create unique index shift_sessions_one_active_per_post_uidx
  on public.shift_sessions (tenant_id, post_id)
  where status = 'active';

create index shift_sessions_status_idx
  on public.shift_sessions (tenant_id, status, opened_at desc);
create index shift_sessions_user_idx
  on public.shift_sessions (tenant_id, user_id, opened_at desc);

-- =============================================================================
-- 2. checkins — metodo de validacao (QR / botao) + vinculo com o plantao
-- =============================================================================
-- qr:     porteiro leu o QR Code do posto (evidencia forte do local).
-- button: assumiu so pelo botao, sem QR ("SEM QR"). Geo sempre e registrada.
create type public.checkin_validation_method as enum ('qr', 'button');

comment on type public.checkin_validation_method is
  'qr = leu o QR do posto; button = botao sem QR (evento marcado como "SEM QR").';

alter table public.checkins
  add column validation_method public.checkin_validation_method not null default 'button',
  add column qr_token_used     text,
  add column shift_session_id  uuid references public.shift_sessions (id);

comment on column public.checkins.qr_token_used is
  'Token lido do QR quando validation_method=qr. Permite auditar QR de outro posto.';
comment on column public.checkins.shift_session_id is
  'Plantao ao qual este check-in pertence. Preenchido pela trigger sync_shift_session.';

create index checkins_shift_session_idx
  on public.checkins (tenant_id, shift_session_id, server_received_at);
-- Excecoes de "SEM QR" para o supervisor revisar.
create index checkins_no_qr_idx
  on public.checkins (tenant_id, server_received_at desc)
  where validation_method = 'button';

-- =============================================================================
-- 3. incidents — botao de panico reusa incidents (ADR-0007)
-- =============================================================================
alter table public.incidents
  add column is_panic         boolean not null default false,
  add column shift_session_id uuid references public.shift_sessions (id);

comment on column public.incidents.is_panic is
  'true = botao de panico: sem formulario, severity critical, alerta imediato. '
  'O protocolo de resposta (reconhecido/resolvido por quem) usa incident_status_changes.';
comment on column public.incidents.shift_session_id is
  'Plantao em que a ocorrencia foi registrada (nullable). Preenchido pelo app.';

-- Panicos abertos em destaque no dashboard.
create index incidents_panic_open_idx
  on public.incidents (tenant_id, server_received_at desc)
  where is_panic = true and status = 'open';

-- =============================================================================
-- 4. Trigger de ciclo de vida do plantao
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER: gere shift_sessions sem exigir que o field_worker tenha
-- permissao de escrita direta na tabela (segue o padrao de handle_new_user).
-- BEFORE INSERT em checkins:
--   entry    -> encerra plantao ativo orfao no posto (abandoned) e abre um novo;
--   periodic -> vincula ao plantao ativo do porteiro;
--   exit     -> vincula e encerra (closed) o plantao ativo.
-- =============================================================================
create or replace function public.sync_shift_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id uuid;
begin
  if new.purpose = 'entry' then
    -- Porteiro anterior esqueceu o check-out? Encerra como abandoned.
    update public.shift_sessions
       set status = 'abandoned', closed_at = now()
     where tenant_id = new.tenant_id
       and post_id = new.post_id
       and status = 'active';

    insert into public.shift_sessions (
      tenant_id, post_id, user_id, schedule_id,
      status, opened_at, opened_by_checkin_id
    )
    values (
      new.tenant_id, new.post_id, new.user_id, new.schedule_id,
      'active', coalesce(new.client_created_at, new.server_received_at), new.id
    )
    returning id into v_session_id;

    new.shift_session_id := v_session_id;

  elsif new.purpose in ('periodic', 'exit') then
    select id into v_session_id
      from public.shift_sessions
     where tenant_id = new.tenant_id
       and post_id = new.post_id
       and user_id = new.user_id
       and status = 'active'
     order by opened_at desc
     limit 1;

    new.shift_session_id := v_session_id;

    if new.purpose = 'exit' and v_session_id is not null then
      update public.shift_sessions
         set status = 'closed',
             closed_at = coalesce(new.client_created_at, new.server_received_at),
             closed_by_checkin_id = new.id
       where id = v_session_id;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.sync_shift_session() is
  'Abre/fecha o plantao (shift_sessions) a partir do purpose do check-in.';

create trigger trg_checkins_sync_shift_session
  before insert on public.checkins
  for each row execute function public.sync_shift_session();

-- =============================================================================
-- 5. Regua de escalonamento (materializada por cron — Sprint 4+)
-- =============================================================================

-- 5a. Nao assumiu o posto: expectativa de INICIO de plantao.
-- Gerada pelo cron a partir de schedules do dia + shifts.start_time.
-- Regua sugerida (ADR-0007): +5 min notifica monitoramento; +10/15 gerente.
create table public.shift_start_expectations (
  id                    uuid primary key default public.uuid_generate_v7(),
  tenant_id             uuid not null references public.tenants (id),
  post_id               uuid not null references public.posts (id),
  schedule_id           uuid not null references public.schedules (id),
  shift_id              uuid not null references public.shifts (id),
  expected_start_at     timestamptz not null,
  window_min            int not null default 5,
  fulfilled_by_session_id uuid references public.shift_sessions (id),
  escalation_level      int not null default 0,
  escalated_at          timestamptz,
  resolved_at           timestamptz,
  created_at            timestamptz not null default now()
);

comment on table public.shift_start_expectations is
  'Materializa "porteiro deveria ter assumido o posto as X". Pendente = '
  'fulfilled_by_session_id null e expected_start_at + window ja passou.';
comment on column public.shift_start_expectations.escalation_level is
  '0 = nada; 1 = notificou monitoramento; 2 = escalou para gerente operacional.';

create index sse_pending_idx
  on public.shift_start_expectations (tenant_id, expected_start_at)
  where fulfilled_by_session_id is null and resolved_at is null;
-- Uma expectativa de inicio por escala (evita duplicata na materializacao).
create unique index sse_schedule_uidx
  on public.shift_start_expectations (schedule_id);

-- 5b. Nao fez o periodico: acrescenta nivel de escalonamento ao que ja existe.
-- Regua sugerida: +15 min monitoramento; +20 min gerente.
alter table public.periodic_checkin_expectations
  add column escalation_level int not null default 0,
  add column resolved_at      timestamptz;

comment on column public.periodic_checkin_expectations.escalation_level is
  '0 = nada; 1 = notificou monitoramento; 2 = escalou para gerente operacional.';

-- =============================================================================
-- 6. RLS das tabelas novas (segue o modelo da migration 07)
-- =============================================================================

-- --- shift_sessions: field_worker ve os proprios; supervisor/admin veem tudo. --
-- Escrita SO pela trigger (SECURITY DEFINER) e por service_role: sem policy de
-- INSERT/UPDATE para authenticated (ausencia de policy = negado).
alter table public.shift_sessions enable row level security;

create policy shift_sessions_select on public.shift_sessions
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (
      (select public.current_user_role()) in ('admin', 'supervisor')
      or user_id = (select auth.uid())
    )
  );

-- --- shift_start_expectations: leitura do tenant; escrita so por service_role. -
alter table public.shift_start_expectations enable row level security;

create policy sse_select on public.shift_start_expectations
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));
