# Sistema Integrado

Plataforma de **evidência operacional** para empresas de portaria: centraliza
check-ins, ocorrências, checklists e auditoria, com IA assistindo o colaborador
de campo. *Internal-first* (Fase 1) e *SaaS-ready* (Fase 2).

> **Status:** Sprint 1 — Fundação técnica. Roadmap Cenário C (faseado 14 + 10
> semanas). Teto de infra: R$ 500/mês.

## Documentação

Comece pelos documentos do projeto, em `docs/`:

| Doc | Conteúdo |
|---|---|
| [01 — Visão e Escopo](docs/01-visao-e-escopo.md) | O que é o produto, MVP, stack, riscos |
| [02 — Mapa de Módulos](docs/02-mapa-de-modulos.md) | Priorização MoSCoW |
| [03 — Roadmap](docs/03-roadmap-cenarios.md) | Cenários A/B/C |
| [04 — Realidade Operacional](docs/04-realidade-operacional.md) | A operação real que o sistema atende |
| [07 — Modelagem de Dados](docs/07-modelagem-de-dados.md) | Schema completo, ER |
| [08 — Arquitetura Técnica](docs/08-arquitetura-tecnica.md) | Estrutura de código, fluxos |
| [10 — Plano do Sprint 1](docs/10-plano-sprint-1.md) | O sprint em execução |
| [ADRs](docs/adr/) | Registro das decisões de arquitetura |

## Estrutura do repositório

```
sistema-integrado/
├── apps/
│   ├── web/          Painel admin — Next.js 15 + Tailwind v4
│   └── mobile/       App de campo — Expo + NativeWind
├── packages/
│   ├── core/         Lógica de domínio agnóstica (UUID v7, geo, ...)
│   ├── types/        Tipos gerados do Supabase + tipos compartilhados
│   └── ui-tokens/    Design tokens (cores, espaçamentos)
├── supabase/
│   ├── migrations/   Schema versionado (8 migrations)
│   ├── functions/    Edge Functions (Sprint 4)
│   └── seed.sql      Dados de desenvolvimento
├── scripts/          Automação (geração de tipos)
└── docs/             Documentos do projeto + ADRs
```

## Pré-requisitos

- **Node 22.x** — recomenda-se [nvm](https://github.com/nvm-sh/nvm) (`nvm use` lê o `.nvmrc`)
- **pnpm 9.x** — `npm install -g pnpm` ou `corepack enable pnpm`
- **Docker Desktop** — necessário para o Supabase local
- **Supabase CLI** — [guia de instalação](https://supabase.com/docs/guides/cli)
- **Expo Go** no celular (Android) para rodar o app mobile

## Setup do zero

```bash
# 1. Instalar dependências (instala tudo do monorepo)
pnpm install

# 2. Variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
#    preencha as chaves do Supabase nos dois arquivos

# 3. Banco de dados (local, via Docker)
supabase start                 # sobe o Postgres local
supabase db reset              # aplica as 8 migrations + seed.sql
pnpm gen:types                 # gera packages/types/src/database.ts

# 4. Rodar os apps
pnpm --filter web dev          # web em http://localhost:3000
pnpm --filter mobile start     # mobile — leia o QR Code com o Expo Go
```

Para usar o projeto Supabase na nuvem em vez do local:

```bash
supabase link --project-ref <ref-do-projeto>
supabase db push                       # aplica as migrations na nuvem
SUPABASE_TARGET=linked pnpm gen:types   # gera os tipos a partir da nuvem
```

> Após o `db push`, ative o auth hook na nuvem: **Authentication > Hooks >
> Custom Access Token**, apontando para `public.custom_access_token_hook`.
> Sem isso, o `tenant_id` não entra no JWT e a RLS bloqueia tudo.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Roda web e mobile em paralelo |
| `pnpm lint` | Biome — lint + formatação (checagem) |
| `pnpm lint:fix` | Biome — corrige o que der |
| `pnpm typecheck` | `tsc` em todos os packages e apps |
| `pnpm test` | Testes (Vitest) em `packages/core` |
| `pnpm build` | Build de produção (web) |
| `pnpm gen:types` | Regenera os tipos do banco |
| `pnpm db:reset` | Recria o banco local com migrations + seed |

## Convenções

- **Toolchain:** pnpm workspaces, Biome (lint + format), TypeScript estrito,
  Conventional Commits (validados por Husky + commitlint).
- **Commits:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`.
- **Banco:** toda mudança de schema é uma migration versionada em
  `supabase/migrations/`. Nunca editar o banco "na mão".
- **Decisões:** toda decisão arquitetural nova vira um ADR em `docs/adr/`.

## Dados de desenvolvimento (seed)

O `seed.sql` cria 1 tenant, 5 usuários, 3 condomínios, 5 postos e checklists.
Login de dev (admin e supervisor) — senha `portaria123`:

- `admin@portaria-modelo.com.br`
- `supervisor@portaria-modelo.com.br`
