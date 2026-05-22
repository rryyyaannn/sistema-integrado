# Sistema Integrado — Arquitetura Técnica

**Versão:** 0.1
**Data:** 14 de maio de 2026
**Status:** Em validação

> Estrutura de código, módulos, deploy e fluxos técnicos da Fase 1.1.

---

## 1. Visão geral de alto nível

```
┌─────────────────────┐         ┌─────────────────────┐
│   App Mobile        │         │   Painel Admin      │
│   (Expo / RN)       │         │   (Next.js)         │
│                     │         │                     │
│   Field worker      │         │   Admin/Supervisor  │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │       Supabase JS Client      │
           │       (Auth, Realtime, etc)   │
           ↓                               ↓
       ┌───────────────────────────────────────┐
       │             Supabase Cloud            │
       │  ┌──────────┐ ┌────────┐ ┌─────────┐  │
       │  │ Postgres │ │ Auth   │ │ Storage │  │
       │  │ + RLS    │ │        │ │         │  │
       │  └──────────┘ └────────┘ └─────────┘  │
       │  ┌────────────────────────────────┐   │
       │  │ Edge Functions (Deno)          │   │
       │  │  - process-audio               │   │
       │  │  - validate-checklist-ai       │   │
       │  │  - generate-periodic-expectations│  │
       │  │  - purge-expired-audio (cron)  │   │
       │  │  - send-push-notifications     │   │
       │  └────────────────────────────────┘   │
       └───────────────────────────────────────┘
                          │
                          │
                ┌─────────┴─────────┐
                ↓                   ↓
        ┌──────────────┐    ┌──────────────┐
        │ OpenAI API   │    │ Expo Push    │
        │ (Whisper +   │    │ (FCM)        │
        │  GPT-4o-mini)│    │              │
        └──────────────┘    └──────────────┘
```

**Componentes:**
- **App Mobile (Expo/RN):** consome Supabase JS direto. Trata cache e fila de retry local. Sem backend intermediário.
- **Painel Admin (Next.js):** mesmo modelo. Renderização híbrida (Server Components onde dá, Client onde precisa de interatividade rica).
- **Supabase:** banco + auth + storage + realtime. Lógica de negócio que precisa de **chave secreta da OpenAI** ou **enfileiramento** mora em Edge Functions.
- **Edge Functions:** disparadas por webhook do Postgres (via `pg_net` ou triggers) ou por agendamento (cron). Stateless, escaláveis.

---

## 2. Princípios arquiteturais

1. **Monolito modular.** Um repositório, vários módulos. Microsserviços apenas se aparecer necessidade real (não vai aparecer no MVP).
2. **Backend-less.** Não temos servidor Node próprio. Supabase + Edge Functions cobre tudo. Reduz superfície de manutenção.
3. **Tipos compartilhados.** Schema do Postgres gera tipos TypeScript via Supabase CLI. Todos os clientes consomem os mesmos tipos.
4. **Server-first quando possível.** No Next.js, Server Components leem do Supabase com a sessão do usuário. Cliente só quando precisa de interação.
5. **Mobile first em UX, web first em funcionalidade.** App é simples e brutal. Web é onde tudo é cadastrável.
6. **Operações idempotentes.** Toda operação importante (criar check-in, registrar ocorrência) usa **chave de idempotência gerada no cliente** (UUID v7), evitando duplicação em retry.
7. **Falhar barulhento.** Erro inesperado vai pro Sentry, com contexto do usuário/tenant/posto. Nada silenciado.

---

## 3. Estrutura de repositório (monorepo com pnpm workspaces)

```
sistema-integrado/
├── README.md                       # Index dos documentos + setup
├── .gitignore
├── .editorconfig
├── .nvmrc                          # Node version pinned
├── package.json                    # Root, scripts globais
├── pnpm-workspace.yaml             # Define os workspaces
├── tsconfig.base.json              # Configuração TS compartilhada
├── biome.json                      # Lint + format (substitui ESLint+Prettier)
├── turbo.json                      # Turborepo: orquestração de build (opcional)
│
├── docs/                           # Documentos do projeto (Markdown)
│   ├── 01-visao-e-escopo.md
│   ├── 02-mapa-de-modulos.md
│   ├── 03-roadmap-cenarios.md
│   ├── 04-realidade-operacional.md
│   ├── 07-modelagem-de-dados.md
│   ├── 08-arquitetura-tecnica.md   # este documento
│   └── adr/
│       ├── 0001-multitenancy-preparada.md
│       ├── 0002-append-only-events.md
│       └── ...
│
├── apps/
│   ├── web/                        # Painel admin (Next.js 15)
│   │   ├── src/
│   │   │   ├── app/                # App Router
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── recover/
│   │   │   │   ├── (app)/          # Rotas autenticadas
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── postos/
│   │   │   │   │   ├── colaboradores/
│   │   │   │   │   ├── clientes/
│   │   │   │   │   ├── escala/
│   │   │   │   │   ├── ocorrencias/
│   │   │   │   │   ├── checklists/
│   │   │   │   │   └── auditoria/
│   │   │   │   └── layout.tsx
│   │   │   ├── modules/            # Camada de domínio organizada por contexto
│   │   │   │   ├── identity/       # Users, auth, perms
│   │   │   │   ├── catalog/        # Clients, posts, shifts
│   │   │   │   ├── checklists/
│   │   │   │   ├── operations/     # Checkins, incidents
│   │   │   │   ├── audit/
│   │   │   │   └── notifications/
│   │   │   ├── components/         # UI compartilhada (shadcn)
│   │   │   └── lib/
│   │   │       ├── supabase/       # Clientes server/client
│   │   │       └── utils/
│   │   └── package.json
│   │
│   └── mobile/                     # App de campo (Expo)
│       ├── app/                    # Expo Router
│       │   ├── (auth)/
│       │   │   └── login.tsx
│       │   ├── (app)/
│       │   │   ├── index.tsx       # Home (botão grande)
│       │   │   ├── checkin/
│       │   │   ├── ocorrencia/
│       │   │   └── perfil.tsx
│       │   └── _layout.tsx
│       ├── src/
│       │   ├── modules/            # Mesmo padrão do web
│       │   ├── components/
│       │   ├── db/                 # Camada offline (DB local)
│       │   │   ├── schema/
│       │   │   ├── sync/
│       │   │   └── repositories/
│       │   ├── audio/              # Gravação de áudio
│       │   └── lib/
│       ├── app.json                # Config Expo
│       └── package.json
│
├── packages/
│   ├── core/                       # Lógica de domínio agnóstica
│   │   ├── src/
│   │   │   ├── identity/
│   │   │   ├── catalog/
│   │   │   ├── operations/
│   │   │   ├── checklists/
│   │   │   └── shared/
│   │   └── package.json
│   │
│   ├── types/                      # Tipos gerados do Supabase + tipos compartilhados
│   │   ├── src/
│   │   │   ├── database.ts         # Gerado por supabase gen types
│   │   │   ├── domain.ts           # Tipos de domínio
│   │   │   └── api.ts              # Tipos de payload de edge functions
│   │   └── package.json
│   │
│   ├── ui-tokens/                  # Design tokens compartilhados (cores, espaçamentos)
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   └── spacing.ts
│   │   └── package.json
│   │
│   └── config/                     # Configs compartilhadas (tsconfig, biome)
│       ├── tsconfig/
│       └── biome/
│
├── supabase/                       # Tudo do Supabase versionado
│   ├── migrations/                 # SQL versionado
│   │   ├── 20260601000000_init.sql
│   │   └── ...
│   ├── functions/                  # Edge Functions
│   │   ├── process-audio/
│   │   │   └── index.ts
│   │   ├── validate-checklist-ai/
│   │   │   └── index.ts
│   │   ├── generate-periodic-expectations/
│   │   │   └── index.ts
│   │   ├── purge-expired-audio/
│   │   │   └── index.ts
│   │   └── send-push-notifications/
│   │       └── index.ts
│   ├── seed.sql                    # Dados de desenvolvimento
│   └── config.toml
│
├── scripts/                        # Scripts de automação
│   ├── generate-types.ts           # Roda supabase gen types
│   └── seed-dev.ts
│
└── .github/
    └── workflows/
        ├── ci.yml                  # Lint + Test + Build
        └── deploy.yml              # Deploy web + edge functions
```

### Por que monorepo?

- **1 dev (você).** Mudar tipo de uma tabela e ver TS errar em web e mobile no mesmo PR é ouro.
- **Lógica de domínio compartilhada.** Validação de checklist, cálculo de geofence, formatação de data — uma vez em `packages/core`, usada em web, mobile e edge functions.
- **Tipos gerados em um lugar.** `packages/types/src/database.ts` é a fonte da verdade. Todos consomem.

### Por que pnpm + workspaces?

- Mais rápido que npm/yarn.
- Resolve dependências de forma estrita (não permite "fantasma").
- Suporte nativo a workspaces.
- `pnpm -r run lint` roda lint em todos os pacotes.

### Por que Biome em vez de ESLint + Prettier?

- Um único binário. Lint + format. Rust-fast.
- Configuração centralizada em `biome.json`.
- Reduz cadeia de dependências em ~40 pacotes.

### Por que Expo Router e Next.js App Router?

- Padrão de file-based routing alinhado. Curva de aprendizado entre os dois é mínima.
- Server Components no Next.js + React em todo lugar significam que muitos componentes podem ser reusados quase 1:1 entre web e mobile (com adaptações de UI primitives).

---

## 4. Padrão de módulo (em `apps/web/src/modules/` e `apps/mobile/src/modules/`)

Cada módulo segue a mesma estrutura interna:

```
modules/operations/
├── api.ts              # Funções que falam com Supabase (Repository)
├── hooks.ts            # React hooks (useCheckins, useCreateCheckin)
├── components/         # Componentes específicos do módulo
│   ├── CheckinCard.tsx
│   └── IncidentForm.tsx
├── schemas.ts          # Validações Zod
└── index.ts            # Exports públicos do módulo
```

**Regra:** módulos só importam de `packages/core`, `packages/types` ou `packages/ui-tokens`. Módulos **não importam de outros módulos diretamente**. Se precisar cruzar, sobe para `packages/core`.

---

## 5. Estratégia offline (Fase 1.1)

**Posição:** cache otimista + fila de retry (não é offline-first completo).

### O que funciona offline (até alguns minutos)
- Tela de check-in carrega checklist do posto **se** já foi acessada antes (cache local com MMKV)
- Submissão de check-in salva em fila local; reenvio automático ao reconectar
- Submissão de ocorrência (texto + foto + áudio) idem
- Upload de mídia em background com retry exponencial

### O que NÃO funciona offline
- Login pela primeira vez no aparelho (precisa de internet para o auth)
- Visualização de histórico/timeline (apenas online)
- Dashboard de supervisor (apenas online)

### Implementação

```
apps/mobile/src/db/
├── schema/             # Estruturas das filas locais
│   ├── pending-checkins.ts
│   ├── pending-incidents.ts
│   └── pending-uploads.ts
├── sync/
│   ├── retry-queue.ts  # Fila com backoff exponencial
│   ├── upload-queue.ts # Upload de mídia
│   └── connectivity.ts # Monitor de conectividade
└── repositories/       # Abstração: chama servidor OU fila
    ├── checkins.ts
    └── incidents.ts
```

**Biblioteca:** MMKV para storage local rápido. Não precisa de WatermelonDB nesta fase.

**Fila persistente:** registros são guardados em MMKV em formato JSON com chaves tipo `pending:checkin:<uuid>`. Worker em background tenta enviar a cada 30s ou na mudança de conectividade.

**Idempotência:** ID do registro (UUID v7) é gerado no cliente. Servidor faz `INSERT ... ON CONFLICT (id) DO NOTHING`. Reenvio acidental não duplica.

### Quando esta abordagem QUEBRA

- Posto fica offline por mais de algumas horas: fila cresce indefinidamente; risco de perder dados se app for fechado
- Conflitos de edição (não temos no MVP porque é append-only)

**Plano de contingência:** se aparecer posto com conectividade ruim na operação real, esse módulo é o primeiro candidato para upgrade para WatermelonDB (Fase 1.2).

---

## 6. Fluxos críticos detalhados

### Fluxo A: Check-in com áudio + validação IA

```
1. Colaborador toca "Fazer check-in" no app
2. App pede leitura de QR Code → token do posto identificado
3. App carrega template do checklist (do cache ou rede)
4. Colaborador grava áudio descrevendo o estado do posto (≤2 min)
5. App salva áudio localmente
6. App gera UUID do checkin e cria registro local com status "pending"
7. App tenta enviar:
   a. Upload do áudio para Supabase Storage (path: tenant/{id}/audios/{checkin_id}.m4a)
   b. INSERT na tabela media_files
   c. INSERT na tabela checkins com status sem responses ainda
8. Quando servidor recebe upload, trigger dispara webhook → Edge Function `process-audio`
9. Edge Function `process-audio`:
   a. Chama OpenAI Whisper com URL pré-assinada do storage
   b. INSERT em audio_transcriptions com o texto
   c. Dispara Edge Function `validate-checklist-ai`
10. Edge Function `validate-checklist-ai`:
    a. Carrega checklist_template do checkin
    b. Carrega transcript
    c. Chama GPT-4o-mini com prompt estruturado pedindo missing_items + extracted_responses
    d. INSERT em ai_validations
    e. UPDATE em checkins.checklist_responses com extracted_responses
    f. Se houver missing_items, envia push para o app do colaborador
11. App recebe push (ou polling Realtime do Supabase) e exibe:
    "Você esqueceu de mencionar: [lanterna, equipamentos]. Quer adicionar?"
12. Colaborador adiciona faltantes (digitando ou novo áudio curto)
13. Submete novamente → cria novo checkin com corrects_id apontando para o original
```

**Falhas previstas e tratamento:**
- Whisper falha → status `failed`, retry 3x com backoff. Após 3 falhas, transcrição manual via interface admin.
- GPT-4o-mini falha → mesmo padrão.
- Push não chega → fallback: app faz polling a cada 30s nos primeiros 5 minutos após enviar.

### Fluxo B: Check-in periódico

```
1. Cron `generate-periodic-expectations` roda diariamente às 00:01 do timezone do tenant
2. Para cada schedule do dia, calcula as expectativas baseado em shift.periodic_checkin_interval_min
3. Materializa em periodic_checkin_expectations
4. Durante o dia, cron `notify-overdue` roda a cada 5 minutos:
   - SELECT expectations onde expected_at + window_min < now() AND fulfilled_by_checkin_id IS NULL AND escalated_at IS NULL
   - Para cada uma: envia push para o colaborador (5 min antes) e supervisor (após o window)
   - Marca escalated_at
5. Colaborador faz check-in periódico
6. Trigger no INSERT de checkin com purpose='periodic' faz UPDATE em fulfilled_by_checkin_id da expectation mais próxima
```

### Fluxo C: Login do colaborador no posto

```
1. App está aberto na tela "Identificar-se" (estado padrão após logout/troca de turno)
2. Colaborador digita matrícula (employee_code)
3. Colaborador digita PIN de 4 dígitos
4. App chama Supabase Auth via email sintético + senha derivada:
   email: colaborador-{employee_code}@{tenant_slug}.local
   senha: hash(pin + salt_fixo_do_tenant)
5. Supabase retorna sessão JWT com claim tenant_id
6. App opcionalmente solicita selfie (configurável por posto)
7. App carrega contexto: posto vinculado a este dispositivo, escala do dia, checklist
8. Tela inicial mostra: nome do colaborador, posto, próximo check-in periódico
```

**Por que email sintético?**
- Supabase Auth exige email
- Colaborador de portaria não tem email corporativo
- Sintético garante unicidade global e identifica o tenant na string

**Segurança do PIN:**
- bcrypt cost 10 no `users.pin_hash`
- 5 tentativas erradas em 5 min → bloqueio de 15 min (campos `last_pin_failed_at` e `pin_failed_count`)
- Admin pode resetar PIN do colaborador a qualquer momento

---

## 7. Deploy e ambientes

### Ambientes

| Ambiente | Web | Mobile | Supabase | Observações |
|---|---|---|---|---|
| **local** | localhost:3000 | Expo Go / dev build | Supabase local (CLI) | Desenvolvimento |
| **preview** | Vercel preview | EAS update channel | Branch do Supabase | Por PR |
| **staging** | sistema-staging.vercel.app | EAS channel `staging` | Projeto Supabase separado | Testes pré-produção |
| **production** | dominio.com.br | Play Store / EAS channel `production` | Projeto Supabase produção | Operação real |

**Decisão importante:** vamos manter **2 projetos Supabase** (staging e production), não 1. Custo: ~2× R$135. **Argumento:** dados reais de colaboradores não devem misturar com testes. **Quando ativar:** semana 13 do roadmap (junto com hardening).

Até a semana 12, **um único Supabase Pro** com schema chamado `staging` ou similar pode bastar. Risco aceitável durante construção.

### CI/CD

`.github/workflows/ci.yml`:
- Trigger: push em qualquer branch + PR para `main`
- Steps: install pnpm, lint (`biome check`), typecheck (`tsc --noEmit`), test, build
- Falha bloqueia merge

`.github/workflows/deploy.yml`:
- Trigger: push em `main`
- Steps: deploy web (Vercel automático), deploy edge functions (`supabase functions deploy`), aplicar migrations (`supabase db push`), atualizar EAS

### Mobile especificamente

- Build de produção via EAS Build (Android only no MVP)
- Updates OTA via EAS Update para mudanças sem nativos
- Versionamento semântico: app version = `1.0.0`, build number autoincremental

---

## 8. Padrões de código

### TypeScript
- `strict: true` em todos os tsconfigs
- Sem `any` (preferir `unknown` + type guard)
- Sem `as` exceto onde explicitamente justificado em comentário

### Naming
- Componentes React: PascalCase
- Funções/variáveis: camelCase
- Constantes top-level: SCREAMING_SNAKE_CASE
- Tipos/Interfaces: PascalCase (sem prefixo `I`)
- Tabelas/colunas SQL: snake_case

### Imports
- Absolutos via `@/...` (configurado em tsconfig paths)
- Ordem: externos → internos packages → internos módulos → relativos
- Biome reordena automaticamente

### Commits
- Convencional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Português ou inglês — escolher e manter. Recomendo **inglês** (alinha com nomes de tabelas e código).

### Pull Requests
- Mesmo trabalhando sozinho. Por quê? Disciplina + GitHub mostra diff bonito.
- Template de PR: o que muda, por quê, screenshots se UI, checklist de revisão

### Testes
- Unitários: Vitest em `packages/core` (lógica de negócio)
- E2E: deixar pra Fase 1.2. No MVP, testes manuais documentados.

---

## 9. Observabilidade

| Camada | Ferramenta | Plano |
|---|---|---|
| Erros front (web/mobile) | Sentry | Free (5k erros/mês) |
| Erros backend (edge functions) | Sentry | Mesma conta |
| Logs Postgres | Supabase dashboard | Incluso |
| Performance API | Supabase dashboard | Incluso |
| Uptime monitoring | UptimeRobot (free) | Webhook em caso de queda |
| Custo IA | Dashboard OpenAI + alerta de orçamento | Configurar limite mensal |

**Práticas:**
- Todo erro inesperado vai pro Sentry com contexto: `tenant_id`, `user_id`, `post_id` (quando aplicável), `app_version`
- Edge Functions logam input/output (sem dados sensíveis) para debug
- Métricas-chave em dashboard custom: check-ins/dia, ocorrências/dia, taxa de transcrição falhada, custo IA acumulado do mês

---

## 10. Decisões em aberto deste documento

1. **Turborepo (sim/não)?** Útil quando build começar a demorar. No início, scripts simples no root resolvem.
2. **Vitest vs Jest?** Vitest é mais rápido e melhor TypeScript. Recomendo Vitest.
3. **Sentry vs Highlight.io vs alternativa OSS?** Sentry padrão de mercado, free tier basta. Mantenho.
4. **Schema único vs múltiplos schemas no Postgres?** Schema único `public` no MVP. Multi-schema pode ajudar em multi-tenant na Fase 2, decidimos lá.
5. **Como gerenciar segredos?** Vercel Environment + Supabase Secrets + `.env.local` (gitignored). Sem complicação.

---

## 11. O que vem depois

- ADRs formalizando as decisões deste documento (próximo entregável)
- Setup inicial do repositório (README, .gitignore, configs base)
- Plano de Sprint 1 (semanas 1–2: Fundação)
