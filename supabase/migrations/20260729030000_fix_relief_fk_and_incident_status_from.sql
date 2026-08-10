-- =============================================================================
-- Sistema Integrado — Migration 14: dois fixes encontrados por verify-db.mjs
-- -----------------------------------------------------------------------------
-- 1. shift_relief_expectations.fulfilled_by_checkin_id tinha FK para checkins.
--    A trigger sync_shift_session roda em BEFORE INSERT do check-in — quando
--    o ramo 'entry' (handoff) ou 'exit' tenta gravar fulfilled_by_checkin_id =
--    new.id, a linha em checkins AINDA NAO EXISTE (so e inserida depois que o
--    BEFORE INSERT retorna), e a FK falha. Mesmo motivo documentado pela
--    migration 10 para shift_sessions.opened_by_checkin_id/closed_by_checkin_id
--    ("sem FK de proposito") — deveria ter seguido o mesmo padrao desde o
--    inicio nesta coluna nova.
-- 2. change_incident_status gravava from_status errado: o UPDATE ... RETURNING
--    * INTO v_incident sobrescrevia v_incident ANTES do INSERT em
--    incident_status_changes, entao from_status saia igual a to_status.
-- =============================================================================

alter table public.shift_relief_expectations
  drop constraint shift_relief_expectations_fulfilled_by_checkin_id_fkey;

comment on column public.shift_relief_expectations.fulfilled_by_checkin_id is
  'uuid SEM FK de proposito: a trigger roda em BEFORE INSERT do check-in que '
  'resolve o aviso (entry do proximo ou exit do mesmo), quando essa linha de '
  'checkins ainda nao existe — uma FK falharia. Integridade garantida pela '
  'propria trigger (usa new.id), mesmo padrao de shift_sessions.opened_by_checkin_id.';

create or replace function public.change_incident_status(
  p_incident_id uuid,
  p_to_status   public.incident_status,
  p_comment     text default null
)
returns public.incidents
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_incident   public.incidents;
  v_old_status public.incident_status;
begin
  select * into v_incident
    from public.incidents
   where id = p_incident_id
     and tenant_id = (select public.current_tenant_id())
  for update;

  if not found then
    raise exception 'incident_not_found_or_not_in_tenant';
  end if;

  if (select public.current_user_role()) not in ('admin', 'supervisor') then
    raise exception 'only_admin_or_supervisor_can_change_incident_status';
  end if;

  v_old_status := v_incident.status;

  update public.incidents
     set status = p_to_status
   where id = p_incident_id
  returning * into v_incident;

  insert into public.incident_status_changes (
    tenant_id, incident_id, from_status, to_status, changed_by, comment
  )
  values (
    v_incident.tenant_id, p_incident_id, v_old_status, p_to_status,
    (select auth.uid()), p_comment
  );

  return v_incident;
end;
$$;

comment on function public.change_incident_status(uuid, public.incident_status, text) is
  'Unico caminho para mudar incidents.status. SECURITY DEFINER porque '
  'incidents nao tem policy de UPDATE (append-only, ADR-0002) — a funcao '
  'valida tenant + papel (admin/supervisor) e grava incident_status_changes '
  'na mesma transacao, com o from_status capturado ANTES do UPDATE. Usada '
  'pelo dashboard para "revisar" ocorrencias high/critical (secao 5.5 do '
  'rascunho funcional v0.2).';
