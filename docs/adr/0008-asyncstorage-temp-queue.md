# ADR-0008 — Fila offline com AsyncStorage no slice (em vez de MMKV)

- **Status:** Aceito (decisão tática do slice; revisar no Sprint 3)
- **Data:** 2026-05-25
- **Relacionado:** ADR-0004 (offline com MMKV)

## Contexto

O ADR-0004 escolheu **MMKV** como storage local rápido para a fila de
check-ins offline. MMKV exige um build nativo (JSI) — funciona perfeitamente
em dev build do EAS, mas não em Expo Go puro, e adiciona uma camada de
rebuild a cada bump da lib.

Durante o slice de 2 semanas, o objetivo é entregar o fluxo nuclear
(login → check-in → fila → dashboard) o quanto antes. Performance da fila
não é gargalo em volumes pequenos (≤ algumas dezenas de itens pendentes
por aparelho), e o `@react-native-async-storage/async-storage` **já está
instalado** (usado pelo cliente Supabase para persistir sessão).

## Decisão

Para a fila offline do slice, usar **AsyncStorage** com chaves `pending:checkin:<uuid>`,
encapsulado em `apps/mobile/src/db/queue.ts`. Idempotência continua sendo
garantida pelo UUID v7 client-side (ADR-0002).

O comportamento e o contrato público da fila são desenhados para que a
migração futura para MMKV seja uma troca de implementação **sem alteração
nas chamadas** (`enqueueCheckin`, `flushPendingCheckins`, `pendingCheckinsCount`).

## Consequências

- Sem rebuild nativo extra para a fila ser plugada.
- AsyncStorage é assíncrono e mais lento que MMKV (~10ms vs ~0.1ms por
  operação); irrelevante no slice, eventualmente perceptível se a fila
  ficar grande.
- Cap em **6MB por chave** no AsyncStorage Android é mais que suficiente
  para JSON de check-in (~2KB cada). Não vamos guardar mídia aqui.

## Quando virar MMKV (gatilho)

- Postos com filas regulares de **>100 itens pendentes** entre flushes.
- Aparelhos low-end onde AsyncStorage começa a custar latência perceptível
  no botão "Fazer check-in".
- Necessidade de inspecionar a fila localmente (MMKV tem ferramenta de
  inspeção mais robusta).

## Alternativas consideradas

- **MMKV agora, conforme ADR-0004 original.** Rejeitada por ora: força
  rebuild nativo na primeira mudança da fila, e o slice precisa ser
  instalável ainda esta semana.
- **react-native-keychain / SecureStore.** Rejeitada: APIs voltadas para
  segredos pequenos (PIN do colaborador, tokens), não para coleções de
  payloads.
