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
| [0007](0007-eas-build-distribution.md) | Distribuição do app de campo via EAS Build (preview interno) | Aceito |
| [0008](0008-asyncstorage-temp-queue.md) | Fila offline com AsyncStorage no slice (em vez de MMKV) | Aceito |
| [0009](0009-reducao-escopo-supervisor-eletronico.md) | Redução de escopo para "Supervisor Eletrônico para Porteiros" | Aceito |
| [0010](0010-decisoes-produto-mvp-porteiro.md) | Decisões de produto do MVP do porteiro | Aceito |
| [0011](0011-aguardando-rendicao-e-reconhecimento-de-escalonamento.md) | Aguardando rendição (pré-checkout) e reconhecimento de escalonamento | Aceito |

_Nota: 0009 e 0010 originalmente colidiam com 0007/0008 (dois ADRs cada,
criados em datas diferentes). Renumerados em 2026-07-29 para restaurar a
sequência única — conteúdo inalterado, só o número e o nome do arquivo._
