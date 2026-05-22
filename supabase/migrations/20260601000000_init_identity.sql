-- =============================================================================
-- Sistema Integrado — Migration 01: Identidade & Acesso
-- -----------------------------------------------------------------------------
-- Cria extensoes, funcoes utilitarias do banco e o dominio de identidade
-- (tenants, users). Base de tudo. Ver docs/07-modelagem-de-dados.md.
-- =============================================================================

-- --- Extensoes ----------------------------------------------------------------
-- pgcrypto: gen_salt/crypt (hash de PIN do colaborador) e gen_random_bytes.
create extension if not exists pgcrypto with schema extensions;

-- --- Funcao: uuid_generate_v7 -------------------------------------------------
-- UUID v7 (RFC 9562): os 48 bits altos sao o timestamp Unix em ms, portanto os
-- IDs sao ordenaveis por tempo. Default de PK em todas as tabelas — da indices
-- mais densos e ordenacao cronologica de graca. Ver docs/adr/0002.
create or replace function public.uuid_generate_v7()
returns uuid
language plpgsql
volatile
set search_path = ''
as $$
begin
  return encode(
    set_bit(
      set_bit(
        overlay(
          uuid_send(gen_random_uuid())
          placing substring(
            int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint)
            from 3
          )
          from 1 for 6
        ),
        52, 1
      ),
      53, 1
    ),
    'hex'
  )::uuid;
end;
$$;

comment on function public.uuid_generate_v7() is
  'Gera UUID v7 (RFC 9562), ordenavel por tempo. Default de PK do projeto.';

-- --- Funcao: set_updated_at (trigger) -----------------------------------------
-- Atualiza a coluna updated_at em todo UPDATE. Plugada nas tabelas de cadastro.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- --- Enum: user_role ----------------------------------------------------------
create type public.user_role as enum ('admin', 'supervisor', 'field_worker');

-- --- Tabela: tenants ----------------------------------------------------------
-- Empresa de portaria que usa o sistema. No MVP existe 1 linha; na Fase 2 vira
-- multi-tenant sem migracao de schema. Ver docs/adr/0001.
create table public.tenants (
  id         uuid primary key default public.uuid_generate_v7(),
  name       text not null,
  slug       text not null unique,
  timezone   text not null default 'America/Sao_Paulo',
  cnpj       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.tenants is
  'Empresa de portaria (cliente do SaaS). MVP: 1 linha. Fase 2: multi-tenant.';

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

-- --- Tabela: users ------------------------------------------------------------
-- Pessoas com acesso ao sistema (admin, supervisor, colaborador de campo).
-- id = auth.users.id do Supabase. Colaborador de campo loga por matricula+PIN
-- (ver docs/adr/0005); admin/supervisor por email+senha.
create table public.users (
  id                 uuid primary key references auth.users (id) on delete cascade,
  tenant_id          uuid not null references public.tenants (id),
  full_name          text not null,
  email              text,
  phone              text,
  role               public.user_role not null default 'field_worker',
  employee_code      text,
  pin_hash           text,
  last_pin_failed_at timestamptz,
  pin_failed_count   int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

comment on table public.users is
  'Usuarios do sistema. id espelha auth.users.id. pin_hash so para field_worker.';

-- Matricula unica por tenant (entre os ativos).
create unique index users_tenant_employee_code_uidx
  on public.users (tenant_id, employee_code)
  where deleted_at is null and employee_code is not null;
create index users_tenant_role_idx on public.users (tenant_id, role);
create index users_tenant_deleted_idx on public.users (tenant_id, deleted_at);

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- --- Trigger: handle_new_user -------------------------------------------------
-- Quando um auth.users e criado, materializa a linha correspondente em
-- public.users a partir do raw_user_meta_data. O fluxo de criacao (admin cria
-- colaborador, ou seed) SEMPRE passa tenant_id/full_name/role nos metadados.
-- tenant_id e NOT NULL de proposito: nao existe usuario sem tenant.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, tenant_id, full_name, email, role, employee_code)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'tenant_id', '')::uuid,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email, 'Sem nome'),
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'role', '')::public.user_role, 'field_worker'),
    nullif(new.raw_user_meta_data ->> 'employee_code', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
