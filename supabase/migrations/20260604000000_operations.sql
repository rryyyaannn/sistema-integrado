-- =============================================================================
-- Sistema Integrado — Migration 04: Eventos Operacionais (APPEND-ONLY)
-- -----------------------------------------------------------------------------
-- checkins, incidents, incident_status_changes, periodic_checkin_expectations.
-- Estas tabelas NAO tem updated_at nem deleted_at: registros sao imutaveis.
-- Correcao = novo registro com corrects_id. Ver docs/adr/0002 e doc 07, dom. D.
-- =============================================================================

-- --- Enum + Tabela: checkins --------------------------------------------------
create type public.checkin_purpose as enum ('entry', 'periodic', 'exit');

-- Nucleo do sistema. Cada check-in (entrada, periodico ou saida) e uma linha.
create table public.checkins (
  id                    uuid primary key default public.uuid_generate_v7(),
  tenant_id             uuid not null references public.tenants (id),
  post_id               uuid not null references public.posts (id),
  user_id               uuid not null references public.users (id),
  schedule_id           uuid references public.schedules (id),
  unscheduled           boolean not null default false,
  purpose               public.checkin_purpose not null,
  checklist_template_id uuid references public.checklist_templates (id),
  checklist_responses   jsonb not null default '{}'::jsonb,
  latitude              numeric(10, 7),
  longitude             numeric(10, 7),
  geo_accuracy_m        numeric,
  geo_within_post       boolean,
  selfie_storage_path   text,
  corrects_id           uuid references public.checkins (id),
  device_id             text,
  app_version           text,
  client_created_at     timestamptz,
  server_received_at    timestamptz not null default now()
);

comment on table public.checkins is
  'Append-only. unscheduled=true quando o colaborador nao estava escalado.';

create index checkins_post_recent_idx
  on public.checkins (tenant_id, post_id, server_received_at desc);
create index checkins_user_recent_idx
  on public.checkins (tenant_id, user_id, server_received_at desc);
create index checkins_geo_exception_idx
  on public.checkins (tenant_id, server_received_at desc)
  where geo_within_post = false;
create index checkins_unscheduled_idx
  on public.checkins (tenant_id, server_received_at desc)
  where unscheduled = true;

-- --- Enum + Tabela: incidents -------------------------------------------------
create type public.incident_status as enum
  ('open', 'acknowledged', 'resolved', 'dismissed');

-- Ocorrencias. O unico campo "editavel" e status, e mesmo assim a mudanca
-- gera um registro em incident_status_changes (via funcao, no Sprint 2+).
create table public.incidents (
  id                   uuid primary key default public.uuid_generate_v7(),
  tenant_id            uuid not null references public.tenants (id),
  post_id              uuid not null references public.posts (id),
  user_id              uuid not null references public.users (id),
  incident_category_id uuid references public.incident_categories (id),
  title                text not null,
  description          text,
  severity             public.incident_severity not null default 'medium',
  latitude             numeric(10, 7),
  longitude            numeric(10, 7),
  corrects_id          uuid references public.incidents (id),
  status               public.incident_status not null default 'open',
  client_created_at    timestamptz,
  server_received_at   timestamptz not null default now()
);

create index incidents_post_recent_idx
  on public.incidents (tenant_id, post_id, server_received_at desc);
create index incidents_status_idx
  on public.incidents (tenant_id, status, server_received_at desc);

-- --- Tabela: incident_status_changes ------------------------------------------
-- Historico append-only das mudancas de status de uma ocorrencia.
create table public.incident_status_changes (
  id          uuid primary key default public.uuid_generate_v7(),
  tenant_id   uuid not null references public.tenants (id),
  incident_id uuid not null references public.incidents (id),
  from_status public.incident_status,
  to_status   public.incident_status not null,
  changed_by  uuid not null references public.users (id),
  comment     text,
  created_at  timestamptz not null default now()
);

create index isc_incident_idx
  on public.incident_status_changes (tenant_id, incident_id, created_at desc);

-- --- Tabela: periodic_checkin_expectations ------------------------------------
-- Janela esperada de check-in periodico, materializada para detectar atrasos.
-- Gerada por cron (generate-periodic-expectations, Sprint 4+).
create table public.periodic_checkin_expectations (
  id                      uuid primary key default public.uuid_generate_v7(),
  tenant_id               uuid not null references public.tenants (id),
  post_id                 uuid not null references public.posts (id),
  schedule_id             uuid not null references public.schedules (id),
  expected_at             timestamptz not null,
  window_min              int not null default 15,
  fulfilled_by_checkin_id uuid references public.checkins (id),
  escalated_at            timestamptz,
  created_at              timestamptz not null default now()
);

create index pce_pending_idx
  on public.periodic_checkin_expectations (tenant_id, expected_at)
  where fulfilled_by_checkin_id is null;
