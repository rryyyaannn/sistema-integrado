-- =============================================================================
-- Sistema Integrado — Migration 02: Cadastros Operacionais
-- -----------------------------------------------------------------------------
-- clients (condominios), posts (postos), shifts (turnos), schedules (escala).
-- Ver docs/07-modelagem-de-dados.md, dominio B.
-- =============================================================================

-- --- Tabela: clients ----------------------------------------------------------
-- Cliente final da empresa de portaria — um condominio residencial.
create table public.clients (
  id            uuid primary key default public.uuid_generate_v7(),
  tenant_id     uuid not null references public.tenants (id),
  name          text not null,
  cnpj          text,
  address       text,
  contact_name  text,
  contact_phone text,
  contact_email text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index clients_tenant_idx on public.clients (tenant_id, deleted_at);

create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- --- Enum + Tabela: posts -----------------------------------------------------
create type public.post_service_type as enum
  ('portaria', 'servicos_gerais', 'tecnico', 'monitoramento');

comment on type public.post_service_type is
  'No MVP (Fase 1.1) so portaria e servicos_gerais sao usados ativamente.';

-- Posto de trabalho. Cada posto gera um QR Code unico para o check-in.
create table public.posts (
  id                 uuid primary key default public.uuid_generate_v7(),
  tenant_id          uuid not null references public.tenants (id),
  client_id          uuid not null references public.clients (id),
  name               text not null,
  service_type       public.post_service_type not null,
  address            text,
  latitude           numeric(10, 7),
  longitude          numeric(10, 7),
  geofence_radius_m  int not null default 200,
  qr_code_token      text not null unique,
  qr_code_rotated_at timestamptz,
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

comment on column public.posts.qr_code_token is
  'Token rotacionavel embutido no QR Code (ex: pt_a3f8...). Regerar se vazar.';

create index posts_tenant_client_idx on public.posts (tenant_id, client_id);
create index posts_tenant_active_idx on public.posts (tenant_id, active, deleted_at);

create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- --- Tabela: shifts -----------------------------------------------------------
-- Configuracao dos turnos padrao de um posto (diurno 06-18, noturno 18-06...).
create table public.shifts (
  id                            uuid primary key default public.uuid_generate_v7(),
  tenant_id                     uuid not null references public.tenants (id),
  post_id                       uuid not null references public.posts (id),
  name                          text,
  start_time                    time not null,
  end_time                      time not null,
  periodic_checkin_interval_min int not null default 120,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  deleted_at                    timestamptz
);

create index shifts_tenant_post_idx on public.shifts (tenant_id, post_id);

create trigger trg_shifts_updated_at
  before update on public.shifts
  for each row execute function public.set_updated_at();

-- --- Enum + Tabela: schedules -------------------------------------------------
create type public.schedule_status as enum
  ('planned', 'confirmed', 'replaced', 'cancelled');

-- Escala: quem trabalha em qual posto/turno/dia.
create table public.schedules (
  id             uuid primary key default public.uuid_generate_v7(),
  tenant_id      uuid not null references public.tenants (id),
  post_id        uuid not null references public.posts (id),
  shift_id       uuid not null references public.shifts (id),
  user_id        uuid not null references public.users (id),
  scheduled_date date not null,
  status         public.schedule_status not null default 'planned',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index schedules_tenant_date_idx on public.schedules (tenant_id, scheduled_date);
create index schedules_tenant_user_date_idx
  on public.schedules (tenant_id, user_id, scheduled_date);
create index schedules_tenant_post_date_idx
  on public.schedules (tenant_id, post_id, scheduled_date);

-- CORRECAO em relacao ao doc 07: a unicidade da posicao e PARCIAL, valendo so
-- para escalas ativas (planned/confirmed). Sem isso, o fluxo de substituicao
-- (marcar a original como 'replaced' e criar uma nova) violaria a constraint,
-- porque as duas linhas teriam o mesmo (post, shift, data).
create unique index schedules_active_position_uidx
  on public.schedules (tenant_id, post_id, shift_id, scheduled_date)
  where status in ('planned', 'confirmed');

create trigger trg_schedules_updated_at
  before update on public.schedules
  for each row execute function public.set_updated_at();
