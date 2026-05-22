# Sistema Integrado — Roadmap: 2 Cenários

**Versão:** 0.1
**Data:** 13 de maio de 2026
**Status:** Em validação

---

## Premissas comuns aos dois cenários

- Desenvolvedor único (você), trabalhando com assistência de IA
- Dedicação aproximada: 25–35 horas úteis/semana (não 40 — você tem uma empresa pra tocar)
- Stack já decidida (Next.js / Supabase / Expo / Whisper)
- "Concluído" significa: feito + testado em 2 postos reais da sua empresa + documentado

---

## Cenário A — MVP Mínimo em ~14 semanas (3,5 meses)

**Objetivo:** colocar o sistema rodando o quanto antes em 2–3 postos selecionados da sua empresa, com o essencial. Aceitar dívida técnica controlada para acelerar validação.

### O que entra
Todos os **Must** do mapa de módulos, **exceto**:
- ❌ Validação semântica de checklist por IA (módulo 8) — fica para o cenário B
- ❌ Sincronização offline plena (módulo 10) — versão "online com cache simples" no lugar
- ❌ Notificações push para supervisores (módulo 14) — usa e-mail no início

### Cronograma resumido

| Bloco | Semanas | Entregável |
|---|---|---|
| 0 — Fundação | 1–2 | Repo, banco, deploy |
| 1 — Identidade + Postos | 3–4 | Cadastro de usuário/posto/QR |
| 2 — Check-in básico | 5–6 | Check-in com checklist via QR |
| 3 — Ocorrências e mídia | 7–8 | Texto, foto, áudio (sem IA ainda) |
| 4 — Transcrição simples | 9 | Áudio → texto via Whisper (sem validação semântica) |
| 5 — Operação contínua | 10–11 | Check-ins periódicos + timeline + dashboard |
| 6 — Cache offline simples | 12 | Operação resiliente a 30 min sem rede |
| 7 — Hardening + LGPD | 13–14 | Termos, auditoria mínima, polimento |

### Vantagens
- Valida rápido com usuários reais
- Aprende cedo onde estão as dores reais
- Custo de oportunidade menor se o produto não der certo

### Desvantagens
- **Dívida técnica em offline-first** que vai precisar ser refeita (cuidado: refazer custa 2x fazer certo)
- IA aplicada fica fraca (só transcrição, sem validação inteligente) — desvende-se da promessa central do briefing original
- Sem push, supervisores podem perder eventos críticos
- Risco de "MVP virar produto final" e a refatoração nunca acontecer

### Quando escolher este cenário
- Você suspeita que o modelo de negócio (SaaS de operação) pode não funcionar e quer validar barato
- Você precisa de prova de conceito rápida para algum stakeholder (sócio, investidor, cliente)
- Sua empresa tem urgência operacional real (problema atual está doendo agora)

---

## Cenário B — MVP Completo em ~24 semanas (6 meses)

**Objetivo:** entregar o MVP com todos os Must do mapa, incluindo offline-first plena e IA aplicada de verdade. Sistema pronto para rodar em todos os postos da sua empresa e para ser apresentado a possíveis primeiros clientes externos.

### O que entra
**Todos os Must** + alguns Should (relatórios PDF, auditoria de ações).

### Cronograma resumido

| Bloco | Semanas | Entregável |
|---|---|---|
| 0 — Fundação | 1–2 | Repo, banco com RLS, deploy, padrões |
| 1 — Identidade + Postos + Admin | 3–5 | Cadastros completos no painel |
| 2 — Check-in básico (online) | 6–8 | Check-in com checklist + kiosk Android |
| 3 — Ocorrências e mídia | 9–11 | Texto, foto, áudio, galeria no admin |
| 4 — IA aplicada | 12–14 | Whisper + GPT-4o-mini valida checklist por voz |
| 5 — Operação contínua | 15–17 | Periódicos, timeline, dashboard, push |
| 6 — Offline-first plena | 18–20 | WatermelonDB sync, resiliente a 8h offline |
| 7 — Maturação | 21–24 | Relatórios PDF, auditoria, LGPD completa, hardening |

### Vantagens
- Produto pronto pra escalar para todos os postos da sua empresa de uma vez
- IA entregue como prometido — diferencial competitivo real
- Offline-first sólido — funciona em postos com conectividade ruim sem dor de cabeça
- Sem dívida técnica grande para Fase 2 (SaaS)
- Demonstrável para potenciais clientes externos

### Desvantagens
- Quase o dobro do tempo de aprendizado real com usuários
- Risco de construir coisas que ninguém vai usar (mitigado por você ser o próprio cliente)
- Maior custo de oportunidade
- Exige disciplina absoluta para não virar 9 meses

### Quando escolher este cenário
- Você confia no modelo de negócio e quer fazer certo da primeira vez
- Sua empresa pode operar mais 6 meses como está (não há fogo no operacional atual)
- Você tem fôlego financeiro/pessoal para 6 meses de construção antes de retorno
- A intenção de virar SaaS depois é firme

---

## Comparativo lado a lado

| Critério | Cenário A (14 semanas) | Cenário B (24 semanas) |
|---|---|---|
| Tempo até primeira utilização real | ~3,5 meses | ~6 meses |
| IA aplicada | Só transcrição | Transcrição + validação semântica |
| Offline-first | Cache simples (30 min) | WatermelonDB + sync robusto |
| Push notifications | Não (usa e-mail) | Sim |
| Relatórios PDF | Não | Sim |
| Auditoria de ações | Mínima | Completa |
| Dívida técnica esperada | Alta | Baixa |
| Risco de retrabalho na Fase 2 (SaaS) | Médio-alto | Baixo |
| Custo de IA durante construção | R$ 50–80/mês | R$ 100–200/mês |
| Custo total estimado de infra/serviços nos 6 primeiros meses | R$ 1.500–2.000 | R$ 2.500–3.500 |
| Compatível com teto de R$ 500/mês | ✅ Sim | ✅ Sim (sobe gradualmente) |

---

## Recomendação do consultor

**Eu recomendo um caminho híbrido que não está nos cenários puros acima:**

### Cenário C — Faseado em 2 entregas (recomendado)

**Fase 1.1 — "MVP de validação" (semanas 1–14)**
Igual ao Cenário A. Coloca em 2 postos seus. Aprende.

**Marco de decisão (semana 14):**
- Se sistema está sendo usado e gerando valor → segue para 1.2
- Se há dores fundamentais (UX, fluxo errado, premissa falsa) → pivota antes de investir mais

**Fase 1.2 — "MVP completo" (semanas 15–24)**
Adiciona o que ficou de fora: validação semântica por IA, offline-first plena, push, relatórios.
Implanta em todos os postos da sua empresa.

### Por que faseado é melhor que escolher um cenário puro?

1. **Você aprende antes de construir o caro.** WatermelonDB + sync é o módulo mais arriscado tecnicamente. Construir ele depois de ter usuários reais usando o sistema diz exatamente o que precisa sincronizar e o que não precisa.
2. **Mantém a opção de pivotar barata.** Se na semana 14 você descobre que o problema central é outro, você gastou 14 semanas, não 24.
3. **Custo cognitivo distribuído.** Construir 24 semanas seguidas sozinho é um caminho conhecido para burnout.
4. **Validação real com usuários acontece cedo.** Você ajusta a Fase 1.2 com base no que aprendeu, não com base nas suas premissas atuais.

### Risco do faseado

- **A tentação de não fazer a Fase 1.2.** Quando o MVP "tá funcionando", o instinto é parar e cuidar de outras coisas. Defesa: marcar a data de início da Fase 1.2 no calendário hoje, antes de começar a Fase 1.1.

---

## Próximos passos após você escolher um cenário

1. Bloco 2 de perguntas (operação real da sua empresa) — entradas para modelagem de dados
2. Bloco 3 de perguntas (LGPD, jurídico trabalhista, restrições)
3. PRD detalhado por módulo (começando pelos do Bloco 1 do cronograma)
4. Modelagem de dados completa com diagrama
5. Arquitetura técnica detalhada
6. Primeira sprint planejada em detalhe
