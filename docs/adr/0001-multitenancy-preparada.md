# ADR-0001 — Multitenancy preparada desde o dia 1, ativada na Fase 2

- **Status:** Aceito
- **Data:** 2026-05-14

## Contexto

O produto é *internal-first*: na Fase 1 atende uma única empresa (a do fundador)
como cliente e validador. Mas a intenção firme é virar um SaaS multi-tenant na
Fase 2, vendido para outras empresas de portaria.

A pergunta é *quando* pagar o custo de preparar o sistema para múltiplos
clientes. Adicionar isolamento de dados depois, com o banco já em produção e
centenas de milhares de linhas, é uma migração cara e arriscada.

## Decisão

Toda tabela carrega uma coluna `tenant_id` desde a primeira migration. O
isolamento é garantido pelo **Row Level Security** do Postgres: cada política
restringe o acesso ao `tenant_id` do usuário, que viaja como claim no JWT
(injetado pelo auth hook).

No MVP existe **um único tenant**. A Fase 2 apenas passa a criar mais linhas em
`tenants` — **sem migração de schema**.

Funcionalidades específicas de SaaS (billing, onboarding self-service,
white-label) **não** são construídas agora.

## Consequências

- Nenhum retrabalho de schema quando o produto virar SaaS.
- A RLS força disciplina de isolamento desde o primeiro dia — é difícil "vazar"
  dados entre tenants por acidente.
- Custo: toda query e toda policy carregam `tenant_id`. É um overhead pequeno,
  mas presente num momento em que só existe um cliente.
- O schema fica um pouco mais complexo do que um sistema single-tenant exigiria.

## Alternativas consideradas

- **Não usar `tenant_id`, adicionar depois.** Rejeitada: migrar um banco de
  produção com 100k+ linhas para multi-tenant é doloroso e arriscado.
- **Um schema Postgres por tenant.** Rejeitada por ora — adiada para a
  especificação de SaaS (ver doc 08, seção 10.4). No MVP, schema único `public`.
