-- =============================================================================
-- Sistema Integrado — Migration 12: Revisão de status de ocorrência
-- -----------------------------------------------------------------------------
-- Fecha uma lacuna já prevista desde a migration 04 (comentário em
-- incidents/incident_status_changes: "a mudanca de status passara por funcao
-- SECURITY DEFINER (Sprint 2)") e identificada na validação do rascunho
-- funcional v0.2 (docs/validacao-rascunho-supervisor-eletronico-v0.2.md,
-- seção 5.5): ocorrências de gravidade alta/crítica devem ser revisadas pelo
-- monitoramento, não ficar só na palavra do porteiro.
--
-- `incidents` não tem policy de UPDATE (append-only por decisão do ADR-0002,
-- só `status` é "editável" e mesmo assim via função). Esta função é o único
-- caminho para mudar o status de uma ocorrência — grava o histórico em
-- incident_status_changes na mesma transação, então nunca existe uma mudança
-- de status sem trilha.
-- =============================================================================

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
  v_incident public.incidents;
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

  update public.incidents
     set status = p_to_status
   where id = p_incident_id
  returning * into v_incident;

  insert into public.incident_status_changes (
    tenant_id, incident_id, from_status, to_status, changed_by, comment
  )
  values (
    v_incident.tenant_id, p_incident_id, v_incident.status, p_to_status,
    (select auth.uid()), p_comment
  );

  return v_incident;
end;
$$;

comment on function public.change_incident_status(uuid, public.incident_status, text) is
  'Unico caminho para mudar incidents.status. SECURITY DEFINER porque '
  'incidents nao tem policy de UPDATE (append-only, ADR-0002) — a funcao '
  'valida tenant + papel (admin/supervisor) e grava incident_status_changes '
  'na mesma transacao. Usada pelo dashboard para "revisar" ocorrencias '
  'high/critical (secao 5.5 do rascunho funcional v0.2).';

grant execute on function public.change_incident_status(uuid, public.incident_status, text)
  to authenticated;
