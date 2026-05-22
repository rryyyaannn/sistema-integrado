# Sprint 1 — Review (Fundação técnica)

> Template de retrospectiva do Sprint 1 (ver `docs/10-plano-sprint-1.md`, dia 10).
> A seção "Execução assistida" é registro factual; o resto é para você preencher
> ao fim do sprint.

## Execução assistida por IA — sessão de 2026-05-22

Scaffold inicial gerado nesta sessão:

- Monorepo pnpm: toolchain (Biome, TypeScript estrito, Husky, commitlint).
- Packages `@si/core` (UUID v7 + geo, com testes Vitest), `@si/types`, `@si/ui-tokens`.
- Schema completo do banco: 8 migrations cobrindo todo o documento 07, com RLS
  por papel, auth hook e `seed.sql`.
- `apps/web` (Next.js 15 + Tailwind v4) e `apps/mobile` (Expo + NativeWind),
  ambos com cliente Supabase e tela de health check.
- CI no GitHub Actions (lint + typecheck + test + build).
- ADRs 0001–0006 e este repositório documentado.

Correções feitas em relação ao documento 07 (registradas em comentário nas
migrations): índice único parcial em `schedules`; `audio_transcriptions.transcript`
tornado nullable.

Pendente de validação com banco real: aplicação das migrations e geração dos
tipos (bloqueado pelo escopo do conector Supabase — ver checklist de handoff).

## O que entreguei

<!-- preencher ao fim do sprint -->

## O que ficou para trás

<!-- preencher -->

## O que demorou mais do que o esperado

<!-- preencher -->

## O que descobri sobre o projeto

<!-- preencher -->

## Riscos novos

<!-- preencher -->

## Próximos passos

<!-- preencher -->
