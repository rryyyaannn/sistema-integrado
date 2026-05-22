-- =============================================================================
-- Sistema Integrado — Migration 03: Templates Configuraveis
-- -----------------------------------------------------------------------------
-- checklist_templates, post_checklist_assignments, incident_categories.
-- Ver docs/07-modelagem-de-dados.md, dominio C.
-- =============================================================================

-- --- Tabela: checklist_templates ----------------------------------------------
-- Modelo de checklist por tipo de posto. `items` e um array JSONB de itens
-- (id, label, type, required, category). Templates sao versionados.
create table public.checklist_templates (
  id           uuid primary key default public.uuid_generate_v7(),
  tenant_id    uuid not null references public.tenants (id),
  name         text not null,
  service_type public.post_service_type,
  version      int not null default 1,
  items        jsonb not null default '[]'::jsonb,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

comment on column public.checklist_templates.items is
  'Array de itens. Cada item: {id, label, type, required, category}. '
  'type: boolean | text | number | select | text_or_audio.';

create index checklist_templates_tenant_idx
  on public.checklist_templates (tenant_id, active, deleted_at);

create trigger trg_checklist_templates_updated_at
  before update on public.checklist_templates
  for each row execute function public.set_updated_at();

-- --- Enum + Tabela: post_checklist_assignments --------------------------------
create type public.checklist_purpose as enum ('entry', 'periodic', 'exit');

-- Liga um posto a um template de checklist. shift_id nulo = vale para todos
-- os turnos do posto.
create table public.post_checklist_assignments (
  id                    uuid primary key default public.uuid_generate_v7(),
  tenant_id             uuid not null references public.tenants (id),
  post_id               uuid not null references public.posts (id),
  shift_id              uuid references public.shifts (id),
  checklist_template_id uuid not null references public.checklist_templates (id),
  purpose               public.checklist_purpose not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index pca_tenant_post_idx
  on public.post_checklist_assignments (tenant_id, post_id);

create trigger trg_pca_updated_at
  before update on public.post_checklist_assignments
  for each row execute function public.set_updated_at();

-- --- Enum + Tabela: incident_categories ---------------------------------------
create type public.incident_severity as enum ('low', 'medium', 'high', 'critical');

-- Categorias configuraveis de ocorrencia.
create table public.incident_categories (
  id                uuid primary key default public.uuid_generate_v7(),
  tenant_id         uuid not null references public.tenants (id),
  name              text not null,
  severity_default  public.incident_severity not null default 'medium',
  notify_supervisor boolean not null default false,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index incident_categories_tenant_idx
  on public.incident_categories (tenant_id, active, deleted_at);

create trigger trg_incident_categories_updated_at
  before update on public.incident_categories
  for each row execute function public.set_updated_at();
