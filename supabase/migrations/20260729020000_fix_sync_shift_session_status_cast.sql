-- =============================================================================
-- Sistema Integrado — Migration 13: fix de cast em sync_shift_session
-- -----------------------------------------------------------------------------
-- Bug encontrado por scripts/verify-db.mjs logo apos aplicar a migration
-- 20260729000000: o CASE WHEN ... THEN 'closed' ELSE 'abandoned' END dentro do
-- UPDATE nao tem como o Postgres inferir o tipo shift_session_status (os dois
-- literais ficam como texto sem um cast explicito), e a atribuicao a uma
-- coluna enum falha ("column status is of type shift_session_status but
-- expression is of type text"). Erro so aparece no ramo 'entry' (handoff
-- avisado x abandoned), unico lugar com um CASE com literais de enum.
-- =============================================================================

create or replace function public.sync_shift_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id       uuid;
  v_had_pre_checkout boolean;
begin
  if new.purpose = 'entry' then
    select (pre_checkout_at is not null) into v_had_pre_checkout
      from public.shift_sessions
     where tenant_id = new.tenant_id
       and post_id = new.post_id
       and status = 'active';

    update public.shift_sessions
       set status = case
                       when v_had_pre_checkout then 'closed'::public.shift_session_status
                       else 'abandoned'::public.shift_session_status
                     end,
           closed_at = now(),
           closed_by_checkin_id =
             case when v_had_pre_checkout then new.id else closed_by_checkin_id end
     where tenant_id = new.tenant_id
       and post_id = new.post_id
       and status = 'active';

    update public.shift_relief_expectations sre
       set fulfilled_by_checkin_id = new.id,
           resolved_at = now()
      from public.shift_sessions ss
     where ss.id = sre.shift_session_id
       and ss.tenant_id = new.tenant_id
       and ss.post_id = new.post_id
       and sre.resolved_at is null;

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

  elsif new.purpose in ('periodic', 'exit', 'pre_checkout') then
    select id into v_session_id
      from public.shift_sessions
     where tenant_id = new.tenant_id
       and post_id = new.post_id
       and user_id = new.user_id
       and status = 'active'
     order by opened_at desc
     limit 1;

    new.shift_session_id := v_session_id;

    if new.purpose = 'pre_checkout' and v_session_id is not null then
      update public.shift_sessions
         set pre_checkout_at = coalesce(new.client_created_at, new.server_received_at)
       where id = v_session_id
         and pre_checkout_at is null;

      insert into public.shift_relief_expectations (
        tenant_id, post_id, shift_session_id, pre_checkout_at
      )
      values (
        new.tenant_id, new.post_id, v_session_id,
        coalesce(new.client_created_at, new.server_received_at)
      )
      on conflict (shift_session_id) where resolved_at is null do nothing;
    end if;

    if new.purpose = 'exit' and v_session_id is not null then
      update public.shift_sessions
         set status = 'closed',
             closed_at = coalesce(new.client_created_at, new.server_received_at),
             closed_by_checkin_id = new.id
       where id = v_session_id;

      update public.shift_relief_expectations
         set fulfilled_by_checkin_id = new.id,
             resolved_at = now()
       where shift_session_id = v_session_id
         and resolved_at is null;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.sync_shift_session() is
  'Abre/fecha o plantao (shift_sessions) a partir do purpose do check-in. '
  'pre_checkout marca aviso de rendicao pendente sem fechar o plantao; exit '
  'fecha e resolve qualquer aviso pendente; entry fecha o anterior como '
  'closed (se avisado) ou abandoned (se nao) e resolve o aviso pendente.';
