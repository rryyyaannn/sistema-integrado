# Sistema Integrado — Sprint 1: Fundação (Semanas 1–2)

**Versão:** 0.1
**Data:** 14 de maio de 2026
**Duração:** 10 dias úteis (~60h de trabalho focado)
**Objetivo:** colocar a base técnica pronta para construir features a partir do Sprint 2

---

## 1. O que vai estar pronto ao fim do Sprint 1

Critérios de pronto **objetivos** (consigo demonstrar):

- [ ] Repositório monorepo configurado e versionado no GitHub
- [ ] Toolchain rodando: pnpm + Biome + TypeScript + Conventional Commits + Husky
- [ ] Supabase configurado (Pro + local CLI) com primeira migration aplicada
- [ ] Schema do banco completo conforme documento 07, com RLS funcional
- [ ] Tipos TypeScript gerados a partir do schema, consumíveis nos apps
- [ ] App web "Olá Sistema Integrado" deployado no Vercel
- [ ] App mobile "Olá Sistema Integrado" rodando no Expo Go
- [ ] CI/CD básico no GitHub Actions (lint + typecheck + build em cada PR)
- [ ] Sentry plugado em web e mobile (erro de teste reportado e visível no dashboard)
- [ ] Seed de desenvolvimento populando 1 tenant + 3 usuários + 5 postos + templates
- [ ] ADR-0006 escrito sobre qualquer decisão técnica nova que apareça

---

## 2. Pré-requisitos antes de começar (do seu lado)

Faça isso ANTES do dia 1 do sprint — leva ~2 horas:

### Contas necessárias (todas free pra começar)
- [ ] **GitHub** — você já tem
- [ ] **Vercel** — login com GitHub
- [ ] **Supabase** — criar conta, criar projeto "sistema-integrado-prod" (Pro: US$25/mês, ativa só na semana 13). Por enquanto **free tier**.
- [ ] **OpenAI** — criar conta, gerar API key, configurar **limite de gasto mensal** (sugestão: US$50)
- [ ] **Sentry** — criar conta, criar 2 projetos (web e mobile)
- [ ] **Expo** — criar conta para EAS (free tier)

### Software local
- [ ] **Node 20.x** instalado (use [nvm](https://github.com/nvm-sh/nvm))
- [ ] **pnpm 9.x** instalado (`npm install -g pnpm`)
- [ ] **Supabase CLI** ([guia](https://supabase.com/docs/guides/cli))
- [ ] **Docker Desktop** (para Supabase local)
- [ ] **Expo Go** no seu iPhone (App Store)
- [ ] **Editor:** VS Code ou Cursor com extensões: Biome, Prettier (desabilitada), ESLint (desabilitada), GitLens

### Decisões pequenas a tomar antes
- [ ] Nome do repositório no GitHub (sugestão: `sistema-integrado`)
- [ ] Domínio para o painel web (pode adiar — Vercel dá subdomínio grátis)

---

## 3. Cronograma dia-a-dia

### Dia 1 (segunda) — Setup do repositório

**Objetivos:**
- Repo criado e versionado
- Toolchain básica funcionando
- Primeiro commit no `main`

**Tarefas:**

1. Descompactar `sistema-integrado-repo-inicial.tar.gz` no seu computador
2. `cd sistema-integrado && git init`
3. Criar repo privado no GitHub e conectar como remote
4. Criar arquivos de toolchain (instruções no documento de arquitetura 08):
   - `package.json` raiz com scripts globais
   - `pnpm-workspace.yaml` definindo workspaces
   - `tsconfig.base.json` com strict mode
   - `biome.json` com config compartilhada
5. Instalar Husky + lint-staged + commitlint:
   ```bash
   pnpm add -D -w husky lint-staged @commitlint/cli @commitlint/config-conventional
   pnpm exec husky init
   ```
6. Configurar hook `pre-commit` rodando `biome check --apply-unsafe`
7. Configurar hook `commit-msg` rodando commitlint
8. **Commit:** `chore: initial monorepo toolchain setup`

**Critério de pronto:**
- `git log` mostra commits
- Tentar commit com mensagem fora do padrão Conventional é rejeitado
- `pnpm biome check .` roda sem erros

### Dia 2 (terça) — Estrutura de packages

**Objetivos:**
- Workspaces criados e instaláveis
- Primeiro pacote compartilhado (`packages/types`) com tipo de teste

**Tarefas:**

1. Criar `packages/config/` com tsconfig base e biome config compartilhados
2. Criar `packages/types/` com `src/index.ts` exportando um tipo dummy `export type Foo = { id: string }`
3. Criar `packages/core/` com função utility de teste `export function generateUuidV7(): string { ... }`
4. Validar que `pnpm install` resolve workspace dependencies
5. Configurar paths no `tsconfig.base.json`: `@core/*`, `@types/*`, `@ui-tokens/*`
6. **Commit:** `chore: setup monorepo packages structure`

**Critério de pronto:**
- `pnpm -r run typecheck` passa em todos os packages
- Import cruzado funcionando (em um teste isolado)

### Dia 3 (quarta) — Supabase setup

**Objetivos:**
- Supabase local rodando
- Projeto Supabase Cloud criado
- Primeira migration aplicada (tabelas `tenants`, `users`, tipos enum)

**Tarefas:**

1. `supabase init` na raiz
2. `supabase start` (sobe Postgres local em Docker)
3. Criar migration `20260601000000_init_identity.sql` com:
   - Extension `uuid-ossp`
   - Função `uuid_generate_v7()` (existe receita pronta — Google)
   - Tipos enum: `user_role`, `post_service_type`, `checkin_purpose`, etc.
   - Tabelas `tenants` e `users`
4. `supabase db reset` aplica e valida
5. Conectar com Supabase Cloud:
   - `supabase link --project-ref <ref>`
   - `supabase db push` (aplica migration no cloud)
6. **Commit:** `feat(db): initial identity tables migration`

**Critério de pronto:**
- Tabelas existem no banco local E no banco cloud
- Conexão via Supabase Studio funciona

### Dia 4 (quinta) — Schema completo + RLS

**Objetivos:**
- Todas as tabelas do documento 07 criadas
- RLS habilitada e políticas básicas escritas
- Auth hook para custom claim `tenant_id`

**Tarefas:**

1. Criar migrations adicionais:
   - `20260602000000_catalog.sql` — clients, posts, shifts, schedules
   - `20260603000000_checklists.sql` — checklist_templates, post_checklist_assignments, incident_categories
   - `20260604000000_operations.sql` — checkins, incidents, incident_status_changes, periodic_checkin_expectations
   - `20260605000000_media_ai.sql` — media_files, audio_transcriptions, ai_validations
   - `20260606000000_audit_notifications.sql` — audit_log, push_tokens, notifications
   - `20260607000000_rls_policies.sql` — políticas RLS para todas as tabelas
   - `20260608000000_auth_hook.sql` — função `custom_access_token_hook` que injeta `tenant_id` no JWT
2. Aplicar via `supabase db reset` (local) e `supabase db push` (cloud)
3. Configurar auth hook no painel Supabase
4. **Commit:** `feat(db): complete schema with RLS and auth hook`

**Critério de pronto:**
- `\dt` no psql mostra todas as tabelas esperadas
- Tentar SELECT sem autenticação retorna vazio (RLS funciona)
- Login de teste retorna JWT com claim `tenant_id`

**Riscos do dia 4:**
- **RLS é a parte mais complexa.** Reserve buffer. Se sentir que vai estourar o dia, foque só nas políticas das tabelas de cadastro e deixe RLS de eventos pro dia 5.

### Dia 5 (sexta) — Geração de tipos + script de seed

**Objetivos:**
- `packages/types/src/database.ts` gerado e atualizado
- Seed de desenvolvimento funcional

**Tarefas:**

1. `supabase gen types typescript --local > packages/types/src/database.ts`
2. Criar script `scripts/generate-types.ts` que automatiza isso, e expor como `pnpm gen:types`
3. Criar `supabase/seed.sql` com:
   - 1 tenant
   - 1 admin, 1 supervisor, 3 colaboradores
   - 3 clientes (condomínios fictícios)
   - 5 postos com QR Code tokens
   - 2 templates de checklist (portaria diurno, SG)
4. Aplicar e validar
5. **Commit:** `feat: add database types generation and dev seed`

**Critério de pronto:**
- `pnpm gen:types` regenera o arquivo
- Após `supabase db reset`, seed roda automaticamente
- Tipos TypeScript visíveis incluindo todas as tabelas

**Marco da semana 1:** ✅ Banco e tipos prontos.

### Dia 6 (segunda) — App web "Olá mundo"

**Objetivos:**
- Next.js 15 instalado em `apps/web/`
- shadcn/ui configurado
- Página inicial renderizando
- Deploy no Vercel rodando

**Tarefas:**

1. `cd apps/web && pnpm create next-app@latest .` (App Router, TS, Tailwind, ESLint não, src dir sim)
2. Remover ESLint, configurar para usar Biome do pacote compartilhado
3. Instalar shadcn/ui: `pnpm dlx shadcn@latest init`
4. Adicionar `Button`, `Card`, `Input` (shadcn add)
5. Criar página inicial mostrando "Sistema Integrado — em construção"
6. Configurar Supabase JS client em `src/lib/supabase/client.ts` e `src/lib/supabase/server.ts`
7. Criar página `/health` que faz um SELECT na tabela `tenants` e mostra "Conexão OK" ou "Erro"
8. Deploy no Vercel (conectar repo, configurar env vars)
9. **Commit:** `feat(web): initial Next.js app with Supabase connection`

**Critério de pronto:**
- `pnpm --filter web dev` roda local em http://localhost:3000
- `/health` mostra "OK" local e em produção
- URL pública da Vercel acessível

### Dia 7 (terça) — App mobile "Olá mundo"

**Objetivos:**
- Expo instalado em `apps/mobile/`
- NativeWind configurado
- App rodando no Expo Go via QR Code
- Supabase JS client funcional

**Tarefas:**

1. `cd apps/mobile && pnpm create expo-app@latest .` (template blank-typescript)
2. Configurar Expo Router
3. Instalar NativeWind seguindo guia oficial
4. Criar tela inicial mostrando "Sistema Integrado — Mobile"
5. Configurar Supabase JS client em `src/lib/supabase.ts` (atenção: precisa de `@supabase/auth-helpers-react` ou `@supabase/supabase-js` com config específica para RN — sem cookies)
6. Tela de teste que faz SELECT na tabela `tenants` e mostra resultado
7. **Commit:** `feat(mobile): initial Expo app with Supabase connection`

**Critério de pronto:**
- `pnpm --filter mobile start` abre Metro
- Expo Go no iPhone lê QR Code e abre o app
- Tela de teste mostra resultado do SELECT

**Risco:** RN + Supabase tem pegadinhas com Realtime e fetch. Resolver com calma, não pular para próximas tarefas se travar.

### Dia 8 (quarta) — CI/CD

**Objetivos:**
- GitHub Actions rodando em cada PR
- Lint + typecheck + build automatizados
- Mensagem clara em falha

**Tarefas:**

1. Criar `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on:
     pull_request:
     push:
       branches: [main]
   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
         - uses: actions/setup-node@v4
           with: { node-version: '20', cache: 'pnpm' }
         - run: pnpm install --frozen-lockfile
         - run: pnpm -r run lint
         - run: pnpm -r run typecheck
         - run: pnpm -r run build
   ```
2. Criar branch protection rule no `main` (PR obrigatório, status check obrigatório)
3. Criar branch `feat/test-ci` com mudança trivial, abrir PR, validar
4. **Commit:** `chore(ci): add github actions workflow`

**Critério de pronto:**
- PR mostra status check rodando
- Falha intencional (`const x: number = 'string'`) é capturada
- Merge na main bloqueado se CI falhar

### Dia 9 (quinta) — Sentry + observabilidade

**Objetivos:**
- Sentry plugado nos dois apps
- Erros aparecendo no dashboard

**Tarefas:**

1. Criar projetos Sentry (web e mobile)
2. **Web:** instalar `@sentry/nextjs`, seguir wizard
3. **Mobile:** instalar `sentry-expo` ou novo `@sentry/react-native`
4. Configurar env vars (DSN) nos dois apps
5. Criar botão "Disparar erro de teste" em ambos os apps
6. Validar que erro chega no Sentry com contexto
7. **Commit:** `feat(observability): integrate sentry on web and mobile`

**Critério de pronto:**
- Erro de teste visível no dashboard de cada projeto
- Source map ou symbolication funcionando (stack trace legível)

### Dia 10 (sexta) — Documentação + ADR + revisão geral

**Objetivos:**
- README do repositório atualizado com instruções de setup que funcionam
- ADR-0006 sobre qualquer decisão técnica nova
- Sprint review pessoal

**Tarefas:**

1. Atualizar `README.md` com instruções de setup testadas (rodar do zero em pasta nova prova que funciona)
2. Criar `docs/adr/0006-*.md` para qualquer decisão técnica nova que apareceu nas semanas (provavelmente terá pelo menos 1)
3. **Sprint review pessoal** — responder por escrito em um documento `docs/sprints/sprint-01-review.md`:
   - O que entregou
   - O que ficou para trás
   - O que demorou mais do que esperado
   - O que descobriu sobre o projeto
   - Riscos novos
   - Próximos passos
4. **Commit:** `docs: sprint 1 review and updated readme`

**Critério de pronto:**
- README permite a alguém clonar e rodar do zero (sem confiar na sua memória)
- Sprint review escrito

**Marco da semana 2:** ✅ Fundação completa. Pronto para Sprint 2.

---

## 4. Tarefas que NÃO estão neste sprint (e por quê)

| Item | Por que ficou fora |
|---|---|
| Telas de cadastro funcionais | Sprint 2 |
| Auth fluxo completo | Sprint 2 |
| QR Code generation | Sprint 2 |
| Camera/áudio no mobile | Sprint 3 |
| Edge Functions | Sprint 4 |
| LGPD | Conversa paralela com seu jurídico até semana 8 |
| Kiosk mode Android | Sprint 6 (perto do go-live) |

---

## 5. Sinais de alerta durante o sprint

Se algum destes acontecer, **pare e me chame** antes de seguir adiante:

- **RLS está vazando dados** (consigo ver linhas de outro tenant)
- **Migrations não estão sendo reversíveis** quando precisei voltar atrás
- **Tipos TypeScript não estão refletindo o schema**
- **Build do Vercel ou Expo está demorando mais de 10 minutos**
- **Mais de 1 dia de atraso acumulado** já no meio do sprint
- **Tive que tomar decisão arquitetural que não está nos ADRs** atuais

---

## 6. Estimativa de risco do sprint

| Tarefa | Risco | Por que |
|---|---|---|
| Dia 1-2 (toolchain) | Baixo | Coisa de receita |
| Dia 3-4 (Supabase + RLS) | **Alto** | RLS pode dar pegadinhas reais |
| Dia 5 (tipos + seed) | Baixo | Direto |
| Dia 6 (web) | Médio | Setup de Tailwind + shadcn pode escorregar |
| Dia 7 (mobile) | **Alto** | Expo + Supabase + NativeWind tem combinação delicada |
| Dia 8 (CI) | Baixo | Receita |
| Dia 9 (Sentry) | Baixo | Wizards prontos |
| Dia 10 (docs) | Baixo | Se chegou aqui, tá feito |

**Estouro provável:** 1-2 dias. **Total realista do sprint: 10-12 dias úteis.** Não se sinta mal se estourar para 12. Se estourar para 15, **paramos e revisitamos** decisões.

---

## 7. Como medir o sucesso deste sprint

Não é "quantas tarefas terminei". É:

1. **No fim do sprint, consigo rodar o projeto do zero em uma nova máquina?**
2. **Um desenvolvedor júnior conseguiria entender o que está acontecendo lendo os docs e o código?**
3. **Os tipos do banco estão batendo com a realidade do banco?**
4. **Quando algo quebra, eu vejo no Sentry?**

Se sim para os 4 → sprint bem-sucedido independente de tarefas check-listadas.

---

## 8. Pós-sprint: o que vem depois

**Sprint 2 (semanas 3-4): Identidade e Postos**
- Telas de auth completas (login, recuperação)
- CRUD de colaboradores no admin
- CRUD de postos com geração de QR Code
- CRUD de clientes (condomínios)
- Cadastro de templates de checklist

**Estimativa:** se Sprint 1 fluir, Sprint 2 é 80% admin web + 20% mobile (só auth no mobile).
