# ADR-0003 — Stack: Supabase + Next.js + Expo, sem backend próprio

- **Status:** Aceito
- **Data:** 2026-05-14

## Contexto

Um desenvolvedor solo, executando com IA, precisa entregar um MVP em ~14 semanas
sob um teto de infra de R$ 500/mês. A escolha de stack precisa maximizar
velocidade e minimizar superfície de manutenção.

## Decisão

- **Banco / Auth / Storage / Realtime:** Supabase (Postgres gerenciado com RLS).
- **Web (painel admin):** Next.js 15 (App Router) + TypeScript.
- **Mobile (app de campo):** Expo (React Native) + TypeScript.
- **Arquitetura:** monolito modular. **Não há backend Node próprio.** Lógica que
  exige segredo (chave da OpenAI) ou enfileiramento mora em **Edge Functions**
  (Deno) do Supabase.
- O schema do Postgres é a fonte da verdade; os tipos TypeScript são gerados a
  partir dele e compartilhados por web, mobile e funções.

## Consequências

- Velocidade alta: um único conjunto de habilidades (TypeScript + React) cobre
  os três frontes; auth, storage e realtime vêm prontos.
- Custo previsível e dentro do teto (~R$ 135/mês de Supabase Pro).
- Menos para manter: sem servidor próprio, sem orquestração de containers.
- Lock-in parcial no Supabase. Mitigado: é Postgres puro por baixo — migrável,
  ainda que com trabalho.
- Edge Functions rodam em Deno, um runtime diferente do dos apps — exige atenção
  ao escrever código compartilhado em `packages/core`.

## Alternativas consideradas

- **Java/Spring (ou similar) com backend próprio.** Rejeitada: lenta demais para
  um dev solo; muito boilerplate e infra para manter.
- **Firebase.** Rejeitada: o modelo NoSQL não combina com a necessidade de
  consultas relacionais e de RLS forte para multitenancy e auditoria.
- **Plataforma no-code.** Rejeitada: teto de customização baixo demais para a
  parte de IA e para a evolução até SaaS.
