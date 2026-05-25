-- =============================================================================
-- Sistema Integrado — Seed de desenvolvimento
-- -----------------------------------------------------------------------------
-- Roda automaticamente apos `supabase db reset`. Popula 1 tenant, 5 usuarios,
-- 3 condominios, 5 postos, turnos, checklists, categorias e escala de exemplo.
--
-- Idempotente: usa ON CONFLICT DO NOTHING, pode rodar mais de uma vez.
-- Senha de dev (admin e supervisor): portaria123
-- =============================================================================

-- --- 1. Tenant ----------------------------------------------------------------
insert into public.tenants (id, name, slug, timezone, cnpj)
values (
  '11111111-1111-7111-8111-111111111111',
  'Portaria Modelo Ltda',
  'portaria-modelo',
  'America/Sao_Paulo',
  '12.345.678/0001-90'
)
on conflict (id) do nothing;

-- --- 2. Usuarios --------------------------------------------------------------
-- Inseridos em auth.users; o trigger handle_new_user materializa public.users
-- a partir do raw_user_meta_data. Colunas de token omitidas de proposito
-- Inclui as colunas *_token como '' (string vazia, nao NULL): o GoTrue scaneia
-- esses campos como string em Go e quebra com "Database error querying schema"
-- se vier NULL. No Supabase Cloud o DEFAULT da coluna nao e aplicado quando
-- omitida no insert, entao passamos explicito.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current,
  email_change, phone_change, phone_change_token, reauthentication_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-0000-7000-8000-000000000001',
    'authenticated', 'authenticated',
    'admin@portaria-modelo.com.br',
    extensions.crypt('portaria123', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'tenant_id', '11111111-1111-7111-8111-111111111111',
      'full_name', 'Ana Administradora',
      'role', 'admin'
    ),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-0000-7000-8000-000000000002',
    'authenticated', 'authenticated',
    'supervisor@portaria-modelo.com.br',
    extensions.crypt('portaria123', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'tenant_id', '11111111-1111-7111-8111-111111111111',
      'full_name', 'Sergio Supervisor',
      'role', 'supervisor'
    ),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-0000-7000-8000-000000000003',
    'authenticated', 'authenticated',
    'colaborador-p001@portaria-modelo.local',
    extensions.crypt('portaria123', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'tenant_id', '11111111-1111-7111-8111-111111111111',
      'full_name', 'Carlos Porteiro',
      'role', 'field_worker',
      'employee_code', 'P001'
    ),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-0000-7000-8000-000000000004',
    'authenticated', 'authenticated',
    'colaborador-p002@portaria-modelo.local',
    extensions.crypt('portaria123', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'tenant_id', '11111111-1111-7111-8111-111111111111',
      'full_name', 'Daniela Vigilante',
      'role', 'field_worker',
      'employee_code', 'P002'
    ),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-0000-7000-8000-000000000005',
    'authenticated', 'authenticated',
    'colaborador-p003@portaria-modelo.local',
    extensions.crypt('portaria123', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'tenant_id', '11111111-1111-7111-8111-111111111111',
      'full_name', 'Eduardo Servicos',
      'role', 'field_worker',
      'employee_code', 'P003'
    ),
    '', '', '', '', '', '', '', ''
  )
on conflict (id) do nothing;

-- --- 3. Clientes (condominios) ------------------------------------------------
insert into public.clients (id, tenant_id, name, address, contact_name, contact_phone)
values
  ('c1111111-0000-7000-8000-000000000001', '11111111-1111-7111-8111-111111111111',
   'Condominio Residencial Acacias', 'Rua das Acacias, 100 - Sao Paulo/SP',
   'Sindico Roberto', '(11) 99999-0001'),
  ('c1111111-0000-7000-8000-000000000002', '11111111-1111-7111-8111-111111111111',
   'Condominio Jardim das Flores', 'Av. das Flores, 250 - Sao Paulo/SP',
   'Sindica Marta', '(11) 99999-0002'),
  ('c1111111-0000-7000-8000-000000000003', '11111111-1111-7111-8111-111111111111',
   'Edificio Vista Verde', 'Rua Verde, 50 - Sao Paulo/SP',
   'Administradora Predial XYZ', '(11) 99999-0003')
on conflict (id) do nothing;

-- --- 4. Postos ----------------------------------------------------------------
insert into public.posts (
  id, tenant_id, client_id, name, service_type,
  address, latitude, longitude, geofence_radius_m, qr_code_token
)
values
  ('b1111111-0000-7000-8000-000000000001', '11111111-1111-7111-8111-111111111111',
   'c1111111-0000-7000-8000-000000000001', 'Portaria Principal', 'portaria',
   'Rua das Acacias, 100', -23.5505000, -46.6333000, 200, 'pt_seed_acacias_principal'),
  ('b1111111-0000-7000-8000-000000000002', '11111111-1111-7111-8111-111111111111',
   'c1111111-0000-7000-8000-000000000001', 'Portaria de Servico', 'portaria',
   'Rua das Acacias, 100 - fundos', -23.5507000, -46.6335000, 150, 'pt_seed_acacias_servico'),
  ('b1111111-0000-7000-8000-000000000003', '11111111-1111-7111-8111-111111111111',
   'c1111111-0000-7000-8000-000000000002', 'Portaria Principal', 'portaria',
   'Av. das Flores, 250', -23.5610000, -46.6560000, 200, 'pt_seed_flores_principal'),
  ('b1111111-0000-7000-8000-000000000004', '11111111-1111-7111-8111-111111111111',
   'c1111111-0000-7000-8000-000000000002', 'Servicos Gerais', 'servicos_gerais',
   'Av. das Flores, 250', -23.5611000, -46.6561000, 200, 'pt_seed_flores_sg'),
  ('b1111111-0000-7000-8000-000000000005', '11111111-1111-7111-8111-111111111111',
   'c1111111-0000-7000-8000-000000000003', 'Portaria Unica', 'portaria',
   'Rua Verde, 50', -23.5700000, -46.6400000, 120, 'pt_seed_vistaverde')
on conflict (id) do nothing;

-- --- 5. Turnos (diurno 06-18, noturno 18-06) ----------------------------------
insert into public.shifts (
  id, tenant_id, post_id, name, start_time, end_time, periodic_checkin_interval_min
)
values
  ('51111111-0000-7000-8000-000000000001', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000001', 'Diurno', '06:00', '18:00', 120),
  ('51111111-0000-7000-8000-000000000002', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000001', 'Noturno', '18:00', '06:00', 120),
  ('51111111-0000-7000-8000-000000000003', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000002', 'Diurno', '06:00', '18:00', 180),
  ('51111111-0000-7000-8000-000000000004', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000003', 'Diurno', '06:00', '18:00', 120),
  ('51111111-0000-7000-8000-000000000005', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000003', 'Noturno', '18:00', '06:00', 120),
  ('51111111-0000-7000-8000-000000000006', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000004', 'Diurno', '07:00', '17:00', 240),
  ('51111111-0000-7000-8000-000000000007', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000005', 'Diurno', '06:00', '18:00', 120),
  ('51111111-0000-7000-8000-000000000008', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000005', 'Noturno', '18:00', '06:00', 120)
on conflict (id) do nothing;

-- --- 6. Templates de checklist ------------------------------------------------
insert into public.checklist_templates (id, tenant_id, name, service_type, items)
values
  (
    '71111111-0000-7000-8000-000000000001',
    '11111111-1111-7111-8111-111111111111',
    'Checklist Portaria - Padrao', 'portaria',
    '[
      {"id":"smartphone","label":"Smartphone do posto","type":"boolean","required":true,"category":"equipamentos"},
      {"id":"lanterna","label":"Lanterna","type":"boolean","required":true,"category":"equipamentos"},
      {"id":"radio","label":"Radio comunicador","type":"boolean","required":false,"category":"equipamentos"},
      {"id":"livro_ocorrencias","label":"Livro de ocorrencias","type":"boolean","required":true,"category":"documentos"},
      {"id":"portoes","label":"Portoes e fechaduras conferidos","type":"boolean","required":true,"category":"seguranca"},
      {"id":"situacao_geral","label":"Situacao geral do posto","type":"text_or_audio","required":true,"category":"observacoes"}
    ]'::jsonb
  ),
  (
    '71111111-0000-7000-8000-000000000002',
    '11111111-1111-7111-8111-111111111111',
    'Checklist Servicos Gerais - Padrao', 'servicos_gerais',
    '[
      {"id":"uniforme","label":"Uniforme e EPI","type":"boolean","required":true,"category":"equipamentos"},
      {"id":"materiais","label":"Materiais de limpeza disponiveis","type":"boolean","required":true,"category":"equipamentos"},
      {"id":"areas_comuns","label":"Areas comuns inspecionadas","type":"boolean","required":true,"category":"seguranca"},
      {"id":"situacao_geral","label":"Situacao geral do posto","type":"text_or_audio","required":true,"category":"observacoes"}
    ]'::jsonb
  )
on conflict (id) do nothing;

-- --- 7. Associacao posto <-> checklist (check-in de entrada) ------------------
insert into public.post_checklist_assignments (
  id, tenant_id, post_id, checklist_template_id, purpose
)
values
  ('81111111-0000-7000-8000-000000000001', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000001', '71111111-0000-7000-8000-000000000001', 'entry'),
  ('81111111-0000-7000-8000-000000000002', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000002', '71111111-0000-7000-8000-000000000001', 'entry'),
  ('81111111-0000-7000-8000-000000000003', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000003', '71111111-0000-7000-8000-000000000001', 'entry'),
  ('81111111-0000-7000-8000-000000000004', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000004', '71111111-0000-7000-8000-000000000002', 'entry'),
  ('81111111-0000-7000-8000-000000000005', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000005', '71111111-0000-7000-8000-000000000001', 'entry')
on conflict (id) do nothing;

-- --- 8. Categorias de ocorrencia ----------------------------------------------
insert into public.incident_categories (
  id, tenant_id, name, severity_default, notify_supervisor
)
values
  ('91111111-0000-7000-8000-000000000001', '11111111-1111-7111-8111-111111111111',
   'Elevador com problema', 'high', true),
  ('91111111-0000-7000-8000-000000000002', '11111111-1111-7111-8111-111111111111',
   'Lampada queimada', 'low', false),
  ('91111111-0000-7000-8000-000000000003', '11111111-1111-7111-8111-111111111111',
   'Tentativa de invasao', 'critical', true),
  ('91111111-0000-7000-8000-000000000004', '11111111-1111-7111-8111-111111111111',
   'Visitante sem autorizacao', 'medium', true),
  ('91111111-0000-7000-8000-000000000005', '11111111-1111-7111-8111-111111111111',
   'Vazamento / infiltracao', 'medium', false)
on conflict (id) do nothing;

-- --- 9. Escala do dia (exemplo) -----------------------------------------------
insert into public.schedules (
  id, tenant_id, post_id, shift_id, user_id, scheduled_date, status
)
values
  ('a2111111-0000-7000-8000-000000000001', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000001', '51111111-0000-7000-8000-000000000001',
   'a1111111-0000-7000-8000-000000000003', current_date, 'confirmed'),
  ('a2111111-0000-7000-8000-000000000002', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000003', '51111111-0000-7000-8000-000000000004',
   'a1111111-0000-7000-8000-000000000004', current_date, 'confirmed'),
  ('a2111111-0000-7000-8000-000000000003', '11111111-1111-7111-8111-111111111111',
   'b1111111-0000-7000-8000-000000000004', '51111111-0000-7000-8000-000000000006',
   'a1111111-0000-7000-8000-000000000005', current_date, 'planned')
on conflict (id) do nothing;
