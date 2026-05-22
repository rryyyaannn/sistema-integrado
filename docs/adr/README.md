# Architecture Decision Records (ADRs)

Um **ADR** registra uma decisão técnica importante: o **contexto** (o problema),
a **decisão** (o que escolhemos) e as **consequências** (o que ganhamos, o que
perdemos, o que descartamos). É uma carta para o nosso eu do futuro, que vai
esquecer o porquê das coisas.

Regras:

- ADRs são numerados em sequência e **nunca editados depois de aceitos**. Se uma
  decisão mudar, cria-se um ADR novo que substitui o antigo (`Substitui ADR-XXXX`).
- Toda decisão arquitetural nova vira um ADR — é item do checklist de PR.

## Índice

| # | Decisão | Status |
|---|---|---|
| [0001](0001-multitenancy-preparada.md) | Multitenancy preparada desde o dia 1 | Aceito |
| [0002](0002-append-only-eventos.md) | Eventos operacionais append-only | Aceito |
| [0003](0003-stack-supabase-nextjs-expo.md) | Stack Supabase + Next.js + Expo, sem backend próprio | Aceito |
| [0004](0004-offline-mmkv.md) | Offline com MMKV em vez de WatermelonDB na Fase 1.1 | Aceito |
| [0005](0005-login-matricula-pin.md) | Login do colaborador por matrícula + PIN | Aceito |
| [0006](0006-monorepo-pnpm.md) | Monorepo pnpm com node-linker hoisted | Aceito |
