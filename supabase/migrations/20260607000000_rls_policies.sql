-- =============================================================================
-- Sistema Integrado — Migration 07: Row Level Security
-- -----------------------------------------------------------------------------
-- Habilita RLS e escreve as politicas de TODAS as tabelas.
--
-- Modelo de isolamento (ver docs/07-modelagem-de-dados.md, secao 5):
--  * Todo acesso e restrito ao tenant do usuario (multitenancy — docs/adr/0001).
--  * field_worker: ve so os proprios eventos; insere os proprios.
--  * supervisor:   ve tudo do tenant; gerencia escala e status de ocorrencia.
--  * admin:        ve tudo; gerencia todos os cadastros.
--  * service_role (Edge Functions/backend): ignora RLS — usado para IA, cron,
--    auditoria. Tabelas sem politica de INSERT/UPDATE so aceitam escrita por ele.
--
-- Tabelas append-only (checkins, incidents, *_changes, audit_log, ...) nao tem
-- politica de UPDATE/DELETE de proposito: a ausencia de politica = negado.
-- =============================================================================

-- --- Funcoes auxiliares -------------------------------------------------------
-- Leem os custom claims que o auth hook injeta no JWT (migration 08).
-- Envolver chamadas destas funcoes em (select ...) nas politicas faz o
-- Postgres avalia-las uma unica vez por query (initplan), nao por linha.
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select nullif(auth.jwt() ->> 'tenant_id', '')::uuid;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
set search_path = ''
as $$
  select auth.jwt() ->> 'user_role';
$$;

-- =============================================================================
-- Dominio A — Identidade
-- =============================================================================

-- --- tenants ------------------------------------------------------------------
alter table public.tenants enable row level security;

create policy tenants_select on public.tenants
  for select to authenticated
  using (id = (select public.current_tenant_id()));

-- --- users --------------------------------------------------------------------
alter table public.users enable row level security;

-- O auth hook (roda como supabase_auth_admin) precisa ler users para montar
-- o JWT. Sem esta policy, o login nao consegue resolver o tenant_id.
create policy users_auth_admin_read on public.users
  for select to supabase_auth_admin
  using (true);

create policy users_select on public.users
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (
      (select public.current_user_role()) in ('admin', 'supervisor')
      or id = (select auth.uid())
    )
  );

create policy users_admin_insert on public.users
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy users_admin_update on public.users
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy users_admin_delete on public.users
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

-- =============================================================================
-- Dominio B/C — Cadastros (leitura: todo o tenant; escrita: admin)
-- =============================================================================

-- --- clients ------------------------------------------------------------------
alter table public.clients enable row level security;

create policy clients_select on public.clients
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

create policy clients_admin_insert on public.clients
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy clients_admin_update on public.clients
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy clients_admin_delete on public.clients
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

-- --- posts --------------------------------------------------------------------
alter table public.posts enable row level security;

create policy posts_select on public.posts
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

create policy posts_admin_insert on public.posts
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy posts_admin_update on public.posts
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy posts_admin_delete on public.posts
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

-- --- shifts -------------------------------------------------------------------
alter table public.shifts enable row level security;

create policy shifts_select on public.shifts
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

create policy shifts_admin_insert on public.shifts
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy shifts_admin_update on public.shifts
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy shifts_admin_delete on public.shifts
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

-- --- schedules (escala: admin OU supervisor escrevem) -------------------------
alter table public.schedules enable row level security;

create policy schedules_select on public.schedules
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

create policy schedules_staff_insert on public.schedules
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) in ('admin', 'supervisor')
  );

create policy schedules_staff_update on public.schedules
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) in ('admin', 'supervisor')
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) in ('admin', 'supervisor')
  );

create policy schedules_staff_delete on public.schedules
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) in ('admin', 'supervisor')
  );

-- --- checklist_templates ------------------------------------------------------
alter table public.checklist_templates enable row level security;

create policy checklist_templates_select on public.checklist_templates
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

create policy checklist_templates_admin_insert on public.checklist_templates
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy checklist_templates_admin_update on public.checklist_templates
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy checklist_templates_admin_delete on public.checklist_templates
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

-- --- post_checklist_assignments -----------------------------------------------
alter table public.post_checklist_assignments enable row level security;

create policy pca_select on public.post_checklist_assignments
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

create policy pca_admin_insert on public.post_checklist_assignments
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy pca_admin_update on public.post_checklist_assignments
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy pca_admin_delete on public.post_checklist_assignments
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

-- --- incident_categories ------------------------------------------------------
alter table public.incident_categories enable row level security;

create policy incident_categories_select on public.incident_categories
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

create policy incident_categories_admin_insert on public.incident_categories
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy incident_categories_admin_update on public.incident_categories
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

create policy incident_categories_admin_delete on public.incident_categories
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) = 'admin'
  );

-- =============================================================================
-- Dominio D — Eventos operacionais (append-only)
-- =============================================================================

-- --- checkins -----------------------------------------------------------------
alter table public.checkins enable row level security;

-- field_worker ve so os proprios; supervisor/admin veem todos do tenant.
create policy checkins_select on public.checkins
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (
      (select public.current_user_role()) in ('admin', 'supervisor')
      or user_id = (select auth.uid())
    )
  );

-- Qualquer usuario do tenant insere check-in em seu proprio nome.
create policy checkins_insert_self on public.checkins
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and user_id = (select auth.uid())
  );
-- Sem UPDATE/DELETE: tabela append-only.

-- --- incidents ----------------------------------------------------------------
alter table public.incidents enable row level security;

create policy incidents_select on public.incidents
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (
      (select public.current_user_role()) in ('admin', 'supervisor')
      or user_id = (select auth.uid())
    )
  );

create policy incidents_insert_self on public.incidents
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and user_id = (select auth.uid())
  );
-- Sem UPDATE/DELETE: a mudanca de status passara por funcao SECURITY DEFINER
-- (Sprint 2) que tambem grava incident_status_changes.

-- --- incident_status_changes --------------------------------------------------
alter table public.incident_status_changes enable row level security;

create policy isc_select on public.incident_status_changes
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) in ('admin', 'supervisor')
  );

create policy isc_insert on public.incident_status_changes
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) in ('admin', 'supervisor')
    and changed_by = (select auth.uid())
  );

-- --- periodic_checkin_expectations (geradas por cron/service_role) ------------
alter table public.periodic_checkin_expectations enable row level security;

create policy pce_select on public.periodic_checkin_expectations
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));
-- Escrita apenas por service_role (Edge Function generate-periodic-expectations).

-- =============================================================================
-- Dominio E — IA & Midia
-- =============================================================================

-- --- media_files --------------------------------------------------------------
alter table public.media_files enable row level security;

create policy media_files_select on public.media_files
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (
      (select public.current_user_role()) in ('admin', 'supervisor')
      or uploaded_by = (select auth.uid())
    )
  );

create policy media_files_insert_self on public.media_files
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and uploaded_by = (select auth.uid())
  );

-- --- audio_transcriptions (escritas pelas Edge Functions) ---------------------
alter table public.audio_transcriptions enable row level security;

create policy audio_transcriptions_select on public.audio_transcriptions
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

-- --- ai_validations (escritas pelas Edge Functions) ---------------------------
alter table public.ai_validations enable row level security;

create policy ai_validations_select on public.ai_validations
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

-- =============================================================================
-- Dominio F — Auditoria & Notificacoes
-- =============================================================================

-- --- audit_log (append-only; escrito por triggers/service_role) ---------------
alter table public.audit_log enable row level security;

create policy audit_log_select on public.audit_log
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and (select public.current_user_role()) in ('admin', 'supervisor')
  );

-- --- push_tokens (cada usuario gerencia os proprios) --------------------------
alter table public.push_tokens enable row level security;

create policy push_tokens_select on public.push_tokens
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and user_id = (select auth.uid())
  );

create policy push_tokens_insert on public.push_tokens
  for insert to authenticated
  with check (
    tenant_id = (select public.current_tenant_id())
    and user_id = (select auth.uid())
  );

create policy push_tokens_update on public.push_tokens
  for update to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and user_id = (select auth.uid())
  )
  with check (
    tenant_id = (select public.current_tenant_id())
    and user_id = (select auth.uid())
  );

create policy push_tokens_delete on public.push_tokens
  for delete to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and user_id = (select auth.uid())
  );

-- --- notifications (cada usuario ve as proprias) ------------------------------
alter table public.notifications enable row level security;

create policy notifications_select on public.notifications
  for select to authenticated
  using (
    tenant_id = (select public.current_tenant_id())
    and recipient_user_id = (select auth.uid())
  );
-- Escrita apenas por service_role (Edge Function send-push-notifications).
