-- =============================================================================
-- Sistema Integrado — Migration 06: Auditoria & Notificacoes
-- -----------------------------------------------------------------------------
-- audit_log, push_tokens, notifications.
-- Ver docs/07-modelagem-de-dados.md, dominio F.
-- =============================================================================

-- --- Tabela: audit_log --------------------------------------------------------
-- Log imutavel de acoes relevantes. Append-only — sem UPDATE/DELETE.
-- Evidencia trabalhista: subiu para Must no doc 04.
create table public.audit_log (
  id            uuid primary key default public.uuid_generate_v7(),
  tenant_id     uuid not null references public.tenants (id),
  actor_user_id uuid references public.users (id),
  action        text not null,
  entity_type   text,
  entity_id     uuid,
  metadata      jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

comment on column public.audit_log.action is
  'Ex: user.created, post.qr_rotated, incident.resolved.';

create index audit_log_recent_idx on public.audit_log (tenant_id, created_at desc);
create index audit_log_entity_idx
  on public.audit_log (tenant_id, entity_type, entity_id, created_at desc);
create index audit_log_actor_idx
  on public.audit_log (tenant_id, actor_user_id, created_at desc);

-- --- Tabela: push_tokens ------------------------------------------------------
-- Tokens de Expo Push por dispositivo/usuario.
create table public.push_tokens (
  id              uuid primary key default public.uuid_generate_v7(),
  tenant_id       uuid not null references public.tenants (id),
  user_id         uuid not null references public.users (id),
  device_id       text,
  expo_push_token text not null,
  platform        text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index push_tokens_user_idx on public.push_tokens (tenant_id, user_id, active);

create trigger trg_push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.set_updated_at();

-- --- Tabela: notifications ----------------------------------------------------
-- Registro historico das notificacoes enviadas.
create table public.notifications (
  id                uuid primary key default public.uuid_generate_v7(),
  tenant_id         uuid not null references public.tenants (id),
  recipient_user_id uuid not null references public.users (id),
  kind              text,
  title             text,
  body              text,
  payload           jsonb,
  delivery_status   text,
  created_at        timestamptz not null default now()
);

create index notifications_recipient_idx
  on public.notifications (tenant_id, recipient_user_id, created_at desc);
