# Sistema Integrado — Mapa de Módulos (MoSCoW)

**Versão:** 0.1
**Data:** 13 de maio de 2026
**Status:** Em validação

---

## Legenda

| Coluna | Significado |
|---|---|
| **Prioridade** | M = Must (MVP), S = Should (MVP se sobrar tempo), C = Could (Fase 1.5), W = Won't (Fase 2+) |
| **Complexidade** | S = pequena, M = média, L = grande, XL = extra grande (mais de 3 semanas sozinho) |
| **Depende de** | Módulos que precisam estar prontos antes deste |

---

## A. Módulos de Produto (o que o usuário enxerga)

| # | Módulo | Prioridade | Complexidade | Depende de | Observação |
|---|---|---|---|---|---|
| 1 | Cadastro e autenticação de usuários | **M** | M | T1, T2 | Login simples + biometria opcional |
| 2 | Gestão de postos de trabalho (CRUD + QR Code) | **M** | M | 1 | Cada posto gera QR único |
| 3 | Gestão de checklists configuráveis | **M** | M | 2 | Templates por tipo de posto |
| 4 | Check-in operacional via QR Code | **M** | L | 2, 3 | Núcleo do app mobile |
| 5 | Registro de ocorrências (texto + foto) | **M** | M | 4 | Categorias configuráveis |
| 6 | Captura e upload de áudio | **M** | M | 4 | Funciona offline, upload diferido |
| 7 | Transcrição automática de áudio (Whisper) | **M** | M | 6 | Whisper API |
| 8 | Validação semântica de checklist por IA | **M** | L | 7 | GPT-4o-mini estruturado, retorna itens faltantes |
| 9 | Check-ins periódicos configuráveis | **M** | M | 4 | Lembretes push + janela de execução |
| 10 | Sincronização offline (mobile ↔ servidor) | **M** | XL | 4, 5, 6 | WatermelonDB pull/push |
| 11 | Painel web administrativo (cadastros base) | **M** | L | 1, 2, 3 | Next.js + shadcn |
| 12 | Timeline de atividades por posto | **M** | M | 4, 5, 9 | Histórico cronológico |
| 13 | Dashboard operacional básico | **M** | M | 12 | 5–8 métricas-chave |
| 14 | Notificações push para supervisores | **M** | M | 5, 9 | Expo Push |
| 15 | Relatórios exportáveis (PDF/CSV) | **S** | M | 12 | Diário + mensal |
| 16 | Galeria de fotos por ocorrência | **S** | S | 5 | Visualização web |
| 17 | Auditoria de ações (quem fez o quê) | **S** | M | 1 | Append-only log |
| 18 | Gestão de escalas e turnos | **C** | L | 2 | Quem trabalha onde, quando |
| 19 | Portal do cliente/síndico | **W** | XL | 15 | Fase 2 |
| 20 | Geofencing e GPS contínuo | **W** | L | — | Fase 2 |
| 21 | Reconhecimento facial no check-in | **W** | XL | — | Fase 3+ |
| 22 | Chatbot/IA conversacional | **W** | XL | — | Fase 3+ |
| 23 | Integrações externas (ERP, ponto, folha) | **W** | XL | — | Fase 2+ |

## B. Módulos Transversais (existem para o sistema funcionar)

| # | Módulo | Prioridade | Complexidade | Depende de | Observação |
|---|---|---|---|---|---|
| T1 | Modelagem de dados + RLS (multitenancy preparada) | **M** | L | — | Base de tudo |
| T2 | Setup de Supabase (auth, storage, edge functions) | **M** | M | T1 | Infra inicial |
| T3 | Estrutura de repositório (monorepo ou polirepo) | **M** | S | — | Decidir cedo |
| T4 | Padrões de código (lint, format, commits, tipos) | **M** | S | T3 | Disciplina desde dia 1 |
| T5 | Pipeline CI/CD básico (GitHub Actions) | **M** | M | T3, T4 | Deploy automático |
| T6 | Modo kiosk + provisionamento Android | **M** | L | — | Pesquisa + implementação |
| T7 | Logging e monitoramento de erros (Sentry) | **M** | S | T2 | Plugar nos 3 frontends |
| T8 | Tratamento e fila de jobs de IA | **M** | M | T2, 7, 8 | Edge function + retry |
| T9 | Documentação técnica (README, ADRs, diagramas) | **M** | S contínuo | — | Atualizar a cada decisão |
| T10 | Estratégia de backup e disaster recovery | **S** | S | T2 | Supabase já faz, validar |
| T11 | LGPD: termos, política, registro de consentimento | **M** | M | 1 | **Bloqueador legal** |
| T12 | Painel de saúde do sistema (uptime, jobs falhando) | **S** | M | T7 | Simples no início |
| T13 | Multitenancy ativa (separação por cliente SaaS) | **W** | L | T1 | Fase 2 |
| T14 | Billing e gestão de assinaturas | **W** | XL | T13 | Fase 2 |
| T15 | Onboarding self-service de novos tenants | **W** | L | T13, T14 | Fase 2 |

---

## Resumo da priorização

| Categoria | Quantidade | Esforço aproximado (sozinho, com IA) |
|---|---|---|
| **Must** (M) — MVP mínimo | 24 itens (15 produto + 9 transversais) | 16–22 semanas |
| **Should** (S) — MVP completo | 4 itens | +4–6 semanas |
| **Could** (C) — Fase 1.5 | 1 item | +3–4 semanas |
| **Won't agora** (W) — Fase 2+ | 9 itens | Não estimar agora |

---

## Ordem de construção sugerida (sequência lógica de dependências)

A ordem abaixo entrega valor o mais cedo possível e respeita dependências técnicas. Cada bloco é uma "fatia" coerente que pode ser demonstrada.

### Bloco 0 — Fundação (semanas 1–2)
T3, T4, T1, T2, T9 — repositório, padrões, banco, Supabase, docs iniciais.
**Critério de saída:** repositório versionado, banco migrado, deploy automático funcionando, ambiente local rodando.

### Bloco 1 — Identidade e Postos (semanas 3–5)
1, 2, 11 (versão mínima do admin), T5, T7
**Critério de saída:** consigo cadastrar usuário, posto, gerar QR Code, ver no admin.

### Bloco 2 — Check-in básico (semanas 6–8)
3, 4, T6 (kiosk), T11 (LGPD inicial)
**Critério de saída:** colaborador lê QR Code do posto, faz check-in com checklist simples, salva no servidor (online apenas).

### Bloco 3 — Ocorrências e mídia (semanas 9–11)
5, 6, 16
**Critério de saída:** colaborador registra ocorrência com texto, foto e áudio. Tudo aparece no admin.

### Bloco 4 — IA aplicada (semanas 12–14)
7, 8, T8
**Critério de saída:** áudio é transcrito automaticamente; checklist por voz é validado e alerta itens faltantes.

### Bloco 5 — Operação contínua (semanas 15–17)
9, 12, 14, 13
**Critério de saída:** check-ins periódicos funcionam, supervisor recebe push, dashboard mostra atividade do dia.

### Bloco 6 — Offline-first (semanas 18–20)
**10** (sozinho ocupa quase 3 semanas inteiras)
**Critério de saída:** colaborador pode operar sem internet por horas; sincronização ao reconectar funciona sem perda de dados.

### Bloco 7 — Maturação (semanas 21–24)
15, 17, T10, T12, polimento, bug fix, hardening
**Critério de saída:** sistema pronto para rodar em todos os postos da sua empresa.

---

## Riscos por bloco

| Bloco | Maior risco | Mitigação |
|---|---|---|
| 0 | Sobreengenharia da base | Resistir à tentação de "preparar tudo" |
| 1 | Subestimar admin | Manter cadastros simples no início |
| 2 | Kiosk Android dar trabalho inesperado | Reservar buffer de 1 semana |
| 3 | Upload de mídia em conexão ruim | Implementar retry + compressão |
| 4 | Custo da IA estourar | Cap de minutos por dia/tenant |
| 5 | Notificação push não chegar (Doze mode Android) | Testar exaustivamente em aparelhos reais |
| 6 | Conflitos de sincronização | Estratégia "last-write-wins por campo" + auditoria |
| 7 | Querer adicionar features novas | Disciplina: encerrar escopo |

---

*Próximo passo: cenários de roadmap (3 meses mínimo vs 6 meses completo) — documento separado.*
