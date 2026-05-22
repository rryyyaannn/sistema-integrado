-- =============================================================================
-- Sistema Integrado — Migration 05: IA & Midia
-- -----------------------------------------------------------------------------
-- media_files, audio_transcriptions, ai_validations.
-- Ver docs/07-modelagem-de-dados.md, dominio E.
-- =============================================================================

-- --- Enum + Tabela: media_files -----------------------------------------------
create type public.media_kind as enum ('audio', 'photo');

-- Arquivos enviados (audios, fotos). Aponta para o Supabase Storage.
create table public.media_files (
  id                 uuid primary key default public.uuid_generate_v7(),
  tenant_id          uuid not null references public.tenants (id),
  kind               public.media_kind not null,
  storage_path       text not null,
  mime_type          text,
  size_bytes         bigint,
  duration_ms        int,
  uploaded_by        uuid references public.users (id),
  linked_entity_type text,
  linked_entity_id   uuid,
  audio_expires_at   timestamptz,
  audio_purged       boolean not null default false,
  created_at         timestamptz not null default now()
);

comment on column public.media_files.audio_expires_at is
  'Retencao LGPD: audios sao apagados apos 90 dias por cron. Fotos: indefinido.';

create index media_files_linked_idx
  on public.media_files (tenant_id, linked_entity_type, linked_entity_id);
create index media_files_audio_purge_idx
  on public.media_files (audio_expires_at)
  where kind = 'audio' and audio_purged = false;

-- --- Enum + Tabela: audio_transcriptions --------------------------------------
create type public.transcription_status as enum
  ('pending', 'processing', 'completed', 'failed');

-- Transcricao de audio (OpenAI Whisper).
-- CORRECAO em relacao ao doc 07: transcript e NULLABLE — uma transcricao
-- 'pending'/'failed' ainda nao tem texto. Forcar NOT NULL obrigaria a inserir
-- string vazia, mascarando o estado real.
create table public.audio_transcriptions (
  id                 uuid primary key default public.uuid_generate_v7(),
  tenant_id          uuid not null references public.tenants (id),
  media_file_id      uuid not null references public.media_files (id),
  provider           text,
  model              text,
  language           text,
  transcript         text,
  confidence         numeric,
  processing_time_ms int,
  cost_cents         int,
  status             public.transcription_status not null default 'pending',
  error_message      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index audio_transcriptions_media_idx
  on public.audio_transcriptions (tenant_id, media_file_id);

create trigger trg_audio_transcriptions_updated_at
  before update on public.audio_transcriptions
  for each row execute function public.set_updated_at();

-- --- Enum + Tabela: ai_validations --------------------------------------------
create type public.validation_status as enum
  ('pending', 'completed', 'failed', 'manual_override');

-- Validacao semantica do checklist por GPT-4o-mini (modulo 8 do roadmap).
create table public.ai_validations (
  id                  uuid primary key default public.uuid_generate_v7(),
  tenant_id           uuid not null references public.tenants (id),
  checkin_id          uuid not null references public.checkins (id),
  transcript_id       uuid references public.audio_transcriptions (id),
  provider            text,
  model               text,
  missing_items       jsonb,
  extracted_responses jsonb,
  confidence          numeric,
  prompt_tokens       int,
  completion_tokens   int,
  cost_cents          int,
  status              public.validation_status not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index ai_validations_checkin_idx
  on public.ai_validations (tenant_id, checkin_id);

create trigger trg_ai_validations_updated_at
  before update on public.ai_validations
  for each row execute function public.set_updated_at();
