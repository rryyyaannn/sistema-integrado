# ADR-0006 — Monorepo pnpm com node-linker hoisted

- **Status:** Aceito
- **Data:** 2026-05-22 (Sprint 1)

## Contexto

O projeto é um monorepo com `apps/web` (Next.js), `apps/mobile` (Expo) e
`packages/*` compartilhados. O gerenciador escolhido é o **pnpm workspaces**
(doc 08).

O pnpm, por padrão, usa um `node_modules` *isolado* — cada dependência fica num
diretório próprio e é ligada por symlink. Isso é ótimo para evitar
dependências-fantasma, mas o **React Native / Metro** tem fricção conhecida e
recorrente com essa estrutura: o resolver do Metro nem sempre segue os symlinks
como esperado.

## Decisão

- **`node-linker=hoisted`** no `.npmrc`: o `node_modules` fica achatado, no
  estilo do npm. É o que o tooling mobile espera.
- Os packages compartilhados são consumidos como **TypeScript-fonte**, sem etapa
  de build: o Next.js os transpila via `transpilePackages`; o Metro os enxerga
  via `watchFolders`.
- **Sem Turborepo** no Sprint 1 — scripts no `package.json` raiz bastam enquanto
  o build for rápido.
- Packages usam o escopo **`@si/*`** (`@si/core`, `@si/types`, `@si/ui-tokens`).
  O alias `@types/*`, sugerido informalmente, foi descartado por colidir com o
  namespace `@types/*` do DefinitelyTyped.

## Consequências

- Expo e Metro funcionam sem gambiarra de configuração.
- Sem build step entre packages: editar um tipo em `@si/types` e ver o erro
  aparecer em web e mobile no mesmo instante.
- Perde-se a proteção do pnpm contra dependências-fantasma — é preciso declarar
  dependências com disciplina.
- Turborepo precisará ser adicionado quando o build começar a doer (cache de
  tarefas); é uma adição prevista, não um retrabalho.

## Alternativas consideradas

- **node-linker isolated (padrão do pnpm).** Rejeitada: fricção recorrente com
  o Metro/React Native consumiria tempo de depuração ao longo de todo o projeto.
- **Adotar Turborepo já no Sprint 1.** Rejeitada: sobreengenharia da fundação
  (risco explícito do Bloco 0). Entra quando houver dor real de build.
