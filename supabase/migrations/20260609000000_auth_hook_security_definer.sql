-- =============================================================================
-- Sistema Integrado — Migration 09: Auth Hook como SECURITY DEFINER
-- -----------------------------------------------------------------------------
-- A migration 08 criou public.custom_access_token_hook como SECURITY INVOKER.
-- Em producao (Supabase Cloud, Postgres 15+), o hook chamado pelo GoTrue como
-- supabase_auth_admin estava devolvendo "Database error querying schema" na
-- emissao do token, mesmo com grants/RLS corretos. A funcao executa OK quando
-- chamada como postgres.
--
-- Causa provavel: combinacao de `set search_path = ''` + DECLARE de variavel
-- com tipo enum (public.user_role) tem comportamento instavel sob alguns roles.
--
-- Fix: marcar a funcao como SECURITY DEFINER. Ela passa a rodar com permissoes
-- do owner (postgres) e nao depende mais da resolucao de tipos do role chamador.
-- A funcao continua revogada de authenticated/anon/public — so supabase_auth_admin
-- pode INVOCAR, e a execucao acontece sob privilegios do definer.
-- =============================================================================

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
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
  'Auth hook do Supabase: adiciona tenant_id e user_role aos claims do JWT. SECURITY DEFINER para evitar problemas de resolucao de tipo enum sob o role supabase_auth_admin.';

-- Os grants da migration 08 continuam validos. Reforco explicito para garantir
-- que so o supabase_auth_admin pode invocar (defesa em profundidade — alem do
-- SECURITY DEFINER, o privilegio EXECUTE controla quem chama).
revoke execute on function public.custom_access_token_hook(jsonb)
  from authenticated, anon, public;

grant execute on function public.custom_access_token_hook(jsonb)
  to supabase_auth_admin;
