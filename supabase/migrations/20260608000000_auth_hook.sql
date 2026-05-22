-- =============================================================================
-- Sistema Integrado — Migration 08: Auth Hook (custom access token)
-- -----------------------------------------------------------------------------
-- Injeta `tenant_id` e `user_role` como claims no JWT a cada emissao de token.
-- E o que faz o RLS (migration 07) funcionar: as politicas leem esses claims
-- via public.current_tenant_id() / public.current_user_role().
--
-- ATENCAO — passo manual na nuvem: alem desta migration, o hook precisa ser
-- ATIVADO no painel do Supabase em Authentication > Hooks > Custom Access Token,
-- apontando para a funcao public.custom_access_token_hook. No ambiente local,
-- o bloco [auth.hook.custom_access_token] do config.toml ja cuida disso.
-- =============================================================================

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_claims    jsonb;
  v_tenant_id uuid;
  v_role      public.user_role;
begin
  select u.tenant_id, u.role
    into v_tenant_id, v_role
  from public.users u
  where u.id = (event ->> 'user_id')::uuid
    and u.deleted_at is null;

  v_claims := event -> 'claims';

  if v_tenant_id is not null then
    v_claims := jsonb_set(v_claims, '{tenant_id}', to_jsonb(v_tenant_id::text));
    v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(v_role::text));
  end if;

  return jsonb_set(event, '{claims}', v_claims);
end;
$$;

comment on function public.custom_access_token_hook(jsonb) is
  'Auth hook do Supabase: adiciona tenant_id e user_role aos claims do JWT.';

-- O hook roda como supabase_auth_admin. Ele precisa: poder executar a funcao,
-- enxergar o schema public e ler a tabela users (a RLS policy users_auth_admin_read
-- da migration 07 complementa este GRANT).
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant select on table public.users to supabase_auth_admin;

-- Ninguem mais pode executar o hook.
revoke execute on function public.custom_access_token_hook(jsonb)
  from authenticated, anon, public;
