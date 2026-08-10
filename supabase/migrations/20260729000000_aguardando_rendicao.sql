-- =============================================================================
-- Sistema Integrado — Migration 11: Aguardando rendição (pré-checkout)
-- -----------------------------------------------------------------------------
-- Delta aditivo do ADR-0011 (ver docs/adr/0011-aguardando-rendicao-e-
-- reconhecimento-de-escalonamento.md). Pré-checkout é uma sinalização OPCIONAL
-- de que o porteiro terminou e aguarda rendição — não substitui o check-out
-- final (`exit`), que continua sendo o mesmo evento de sempre.
--
--   1. checkins.purpose ganha 'pre_checkout'.
--   2. shift_sessions.pre_checkout_at — "aguardando rendição" no dashboard é
--      estado DERIVADO (status='active' AND pre_checkout_at is not null), sem
--      novo valor no enum shift_session_status.
--   3. shift_relief_expectations — mesma forma de shift_start_expectations,
--      mas materializada pela própria trigger no momento do pré-checkout
--      (evento real, não previsão de escala — não depende de cron para existir,
--      só para escalar o alerta, que segue sendo Sprint 4).
--   4. acknowledged_at em shift_start_expectations / periodic_checkin_expectations
--      / shift_relief_expectations — ação do monitoramento muda a mensagem do
--      alerta ("em andamento") sem interromper o histórico nem escapar do
--      escalonamento até ser de fato resolvido (ADR-0011 #3).
--   5. Trigger sync_shift_session: 'entry' que encontra um plantão órfão COM
--      pré-checkout fecha como 'closed' (handoff avisado) em vez de 'abandoned'
--      (que fica reservado para quem sumiu sem sinalizar nada).
-- =============================================================================

-- --------------------------------------------------------------------------
-- 1. checkins.purpose — novo valor 'pre_checkout'
-- --------------------------------------------------------------------------
alter type public.checkin_purpose add value 'pre_checkout';

-- --------------------------------------------------------------------------
-- 2. shift_sessions.pre_checkout_at
-- --------------------------------------------------------------------------
alter table public.shift_sessions
  add column pre_checkout_at timestamptz;

comment on column public.shift_sessions.pre_checkout_at is
  'Preenchido pela trigger quando o porteiro registra um check-in pre_checkout '
  '(aviso opcional de que terminou e aguarda rendicao). NULL = nenhum aviso '
  'feito. "Aguardando rendicao" no dashboard = status=''active'' AND '
  'pre_checkout_at is not null.';

comment on column public.shift_sessions.closed_by_checkin_id is
  'Checkin que fechou o plantao. Normalmente o proprio exit do porteiro; '
  'quando o fechamento vem de um handoff avisado (pre_checkout + entrada do '
  'proximo no mesmo posto), aponta para o checkin de entrada do proximo.';

-- --------------------------------------------------------------------------
-- 3. shift_relief_expectations — regua de "aguardando rendicao"
-- --------------------------------------------------------------------------
create table public.shift_relief_expectations (
  id                      uuid primary key default public.uuid_generate_v7(),
  tenant_id               uuid not null references public.tenants (id),
  post_id                 uuid not null references public.posts (id),
  shift_session_id        uuid not null references public.shift_sessions (id),
  pre_checkout_at         timestamptz not null,
  window_min              int not null default 10,
  fulfilled_by_checkin_id uuid references public.checkins (id),
  escalation_level        int not null default 0,
  escalated_at            timestamptz,
  acknowledged_at         timestamptz,
  resolved_at             timestamptz,
  created_at              timestamptz not null default now()
);

comment on table public.shift_relief_expectations is
  'Materializada pela trigger sync_shift_session no momento do pre_checkout '
  '(evento real, nao previsao de escala — por isso nao depende de cron para '
  'existir). Pendente = fulfilled_by_checkin_id is null e resolved_at is null. '
  'Regua de escalonamento (notificar) roda no mesmo cron/Edge Function de '
  'Sprint 4 que ainda vai ligar shift_start_expectations e '
  'periodic_checkin_expectations.';
comment on column public.shift_relief_expectations.escalation_level is
  '0 = nada; 1 = notificou monitoramento; 2 = escalou para gerente operacional.';
comment on column public.shift_relief_expectations.acknowledged_at is
  'Preenchido quando o monitoramento registra providencia sem ainda ter '
  'resolvido — o alerta muda de "sem atendimento" para "em andamento" mas '
  'continua visivel/pendente ate resolved_at (ADR-0011 #3).';

create index sre_pending_idx
  on public.shift_relief_expectations (tenant_id, pre_checkout_at)
  where fulfilled_by_checkin_id is null and resolved_at is null;
-- No maximo uma expectativa de rendicao pendente por plantao.
create unique index sre_shift_session_pending_uidx
  on public.shift_relief_expectations (shift_session_id)
  where resolved_at is null;

alter table public.shift_relief_expectations enable row level security;

create policy sre_select on public.shift_relief_expectations
  for select to authenticated
  using (tenant_id = (select public.current_tenant_id()));

-- --------------------------------------------------------------------------
-- 4. acknowledged_at nas expectations existentes (ADR-0011 #3)
-- --------------------------------------------------------------------------
alter table public.shift_start_expectations
  add column acknowledged_at timestamptz;
alter table public.periodic_checkin_expectations
  add column acknowledged_at timestamptz;

comment on column public.shift_start_expectations.acknowledged_at is
  'Preenchido quando o monitoramento registra providencia sem ainda ter '
  'resolvido — o alerta muda de "sem atendimento" para "em andamento" mas '
  'continua escalando/visivel ate resolved_at (ADR-0011 #3).';
comment on column public.periodic_checkin_expectations.acknowledged_at is
  'Mesma semantica de shift_start_expectations.acknowledged_at.';

-- --------------------------------------------------------------------------
-- 5. Trigger sync_shift_session — pre_checkout + handoff reconhecido
-- --------------------------------------------------------------------------
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
    -- Porteiro anterior tinha avisado (pre-checkout)? Fecha como closed
    -- (handoff esperado). Sem aviso, continua abandoned (sumiu sem avisar).
    select (pre_checkout_at is not null) into v_had_pre_checkout
      from public.shift_sessions
     where tenant_id = new.tenant_id
       and post_id = new.post_id
       and status = 'active';

    update public.shift_sessions
       set status = case when v_had_pre_checkout then 'closed' else 'abandoned' end,
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
