# Validação do rascunho funcional "Supervisor Eletrônico v0.2" (28/07/2026)

Documento de origem: rascunho funcional enviado pelos responsáveis do produto
em 28/07/2026, com uma ressalva por áudio sobre pré-check-out (ver
[ADR-0011](adr/0011-aguardando-rendicao-e-reconhecimento-de-escalonamento.md)).

Este arquivo compara, seção a seção, o que o rascunho propõe contra o que já
foi **decidido** (ADR-0009/0010/0011) e **construído** (migrations
`20260701000000`, `20260729000000` a `20260729030000` + `apps/mobile` +
`apps/web`) no projeto. Objetivo: não repetir essa análise do zero em
conversas futuras — atualizar este arquivo quando uma decisão nova for
tomada.

Verificado ponta a ponta contra o banco remoto real via
`node scripts/verify-db.mjs` — 44/44 PASS, incluindo pré-checkout, o handoff
avisado (fecha `closed`) vs. sem aviso (fecha `abandoned`), e
`change_incident_status` chamado por um usuário supervisor autenticado de
verdade. Duas correções de bug (FK inválida em trigger BEFORE INSERT;
`from_status` errado) entraram na migration `20260729030000`.

Legenda: ✅ decidido e construído · 🔜 decidido, aguardando Sprint (schema
pronto, disparo automático pendente) · ⚠️ parcial / gap identificado · ❓
decisão ainda em aberto.

## 3. Participantes

| Papel no documento | Mapeamento no projeto | Status |
|---|---|---|
| Controlador de acesso / porteiro | `user_role = 'field_worker'`, app mobile | ✅ |
| Monitoramento | `user_role = 'supervisor'` (ADR-0010 #3) | ✅ |
| Gestor/gerente | `user_role = 'admin'` do tenant (ADR-0010 #3) | ✅ |
| Administração interna | mesmo `admin`, cadastros web | ✅ (CRUDs completos ainda em construção — fora do escopo desta validação) |

## 4. Conceitos (check-in, checklist, periódico, ocorrência, pânico, pré-checkout, checkout)

Todos os conceitos do documento têm equivalente direto no schema, incluindo
pré-checkout desde 2026-07-29 (`checkin_purpose = 'pre_checkout'`,
`shift_sessions.pre_checkout_at`, `shift_relief_expectations` — ver ADR-0011).

## 5. Fluxo principal do turno

| Item do documento | Status | Evidência |
|---|---|---|
| 5.1 Posto habitual não trava entrada em outro posto | ✅ | `assumir.tsx` mostra sempre a opção "outro posto" além da escala do dia |
| 5.1 Motivo simples quando entra fora da escala | ✅ | `checkin/form.tsx` pergunta motivo (opcional) quando o posto não está na escala de hoje; grava em `checklist_responses.reason` e marca `unscheduled=true` + `schedule_id` |
| 5.2 Check-in com usuário+PIN | ✅ | ADR-0005 |
| 5.2 QR do posto + alternativa manual | ✅ | `checkin_validation_method` (`qr`/`button`), ADR-0010 #1 |
| 5.2 QR não é única prova (risco aceito no protótipo) | ✅ | mesma decisão, palavra por palavra (ADR-0010 #1) |
| 5.3 Checklist inicial por item | ⚠️ | schema pronto (`checklist_templates`, `post_checklist_assignments`); renderização item-a-item é **Sprint 3** (ADR-0010 #4) — confirmar se já foi feita nesta fatia ou segue pendente |
| 5.3 Áudio → transcrição → confirmação antes de enviar | 🔜 | `media_files`/`audio_transcriptions` existem desde a migration 5; fluxo de UI de confirmação não verificado nesta rodada |
| 5.4 Periódico "sem novidades" / "houve alteração" / "ocorrência" | ✅ | `periodico.tsx`, ADR-0010 #2 |
| 5.4 Intervalo configurável por posto | ✅ | `shifts.periodic_checkin_interval_min` (default 120) |
| 5.5 Ocorrência com categoria/gravidade/descrição/situação/responsável | ✅ | `incidents` + `incident_status_changes` |
| 5.5 Gravidade sugerida pelo porteiro, grave/crítica revisada pelo monitoramento | ✅ | `change_incident_status()` (`SECURITY DEFINER`, migration 12) + botão "Revisar" no dashboard para `incidents` `high`/`critical` abertas — grava `incident_status_changes` |
| 5.6 Botão de pânico, envio imediato, cancelamento não incluído | ✅ | reusa `incidents.is_panic` (ADR-0009 #2); "envio imediato, sem atraso" é a recomendação do próprio documento e é a implementada |
| 5.7 Pré-check-out / aguardando rendição / check-out final | ✅ | **ADR-0011** — implementado: `encerrar.tsx` ganhou ação secundária "avisar e aguardar rendição"; dashboard mostra o estado derivado. Falta só o disparo automático de notificação (Sprint 4, régua já materializada) |
| 5.7 Jornada estendida não deve gerar alerta de não-rendição | ✅ | o gatilho é `pre_checkout_at` (evento real), nunca a duração da escala — ver ADR-0011 #2 |

## 6. Alertas por ausência de confirmação

| Item | Status | Evidência |
|---|---|---|
| Régua 5/10/15 min, escalando monitoramento → gestor | ✅ decidido, 🔜 disparo | `shift_start_expectations`/`periodic_checkin_expectations`/`shift_relief_expectations` com `escalation_level`; cron/Edge Function de disparo = Sprint 4 |
| Ação do monitoramento muda mensagem em vez de esconder o alerta | ✅ decidido, 🔜 UI de reconhecer | `acknowledged_at` já existe nas três tabelas de expectation (migration 11); UI de "reconhecer" no dashboard fica para quando o cron de Sprint 4 estiver gerando alertas de verdade nas duas tabelas mais antigas |
| Tempos configuráveis, postos de risco com tempos menores | ✅ | mesmo padrão de coluna configurável por posto/turno já usado em todo o schema |

## 7-9. Painéis (postos, monitoramento, gestor)

| Item | Status | Evidência |
|---|---|---|
| Estados do posto (fora de operação, ativo, atrasado, aguardando rendição, etc.) | ✅ | `MonitorDashboard.tsx` distingue ativo / aguardando rendição / aguardando início / ocorrências / pânicos |
| Fila de prioridade (pânico > grave > sem confirmação > ocorrência > aviso) | ⚠️ parcial | pânico já vem primeiro na consulta de ocorrências; não há uma fila unificada entre as seções (plantões/ocorrências/aguardando são blocos separados) |
| Visão resumida do gestor | ⚠️ | painel web hoje é unificado para supervisor/admin; visão "resumida" separada para o gestor não existe (Fase 1.2) |

## 10. Histórico, auditoria e relatórios

| Item | Status | Evidência |
|---|---|---|
| Tudo com data/hora/responsável, correção nunca apaga silenciosamente | ✅ | append-only (ADR-0002) — `corrects_id` em vez de UPDATE/DELETE; única exceção consciente é `incidents.status` (via `change_incident_status`, sempre logada em `incident_status_changes`) |
| Diferenciar "registrado no horário" de "enviado depois" (offline) | ✅ | `client_created_at` vs `server_received_at` já no schema; fila offline (ADR-0004/0008, `enqueueCheckin`) |
| Relatórios avançados (tempo de resposta, atrasos, repetição) | ❓ fora do escopo enxuto | explicitamente adiado — não é uma lacuna, é decisão de escopo (ADR-0009) |

## 11. Regras gerais

| Item | Status |
|---|---|
| 11.1 Uso simples, poucos toques | ✅ — critério de design seguido em todas as telas mobile, incluindo as novas (pré-checkout é uma ação a mais opcional, não um passo obrigatório) |
| 11.2 Áudio/transcrição com confirmação antes de enviar | 🔜 mesma nota da seção 5.3 |
| 11.3 Falha de internet: registra hora local, envia depois | ✅ já implementado (fila offline) |
| 11.4 PIN + timeout de sessão + permissão por perfil | ✅ (ADR-0005, RLS por `current_user_role()`) |
| 11.5 LGPD (retenção, acesso a áudio, descarte) | ❓ **pendente, é jurídico** | já sinalizado desde o plano de Sprint 1 ("conversa paralela com jurídico até semana 8") — não é um gap técnico |

## 12. Escopo sugerido para o protótipo

Compatível quase 1:1 com o que o ADR-0009 já cortou como escopo enxuto. Sem
divergência.

## 13. Pontos que precisavam de decisão — o que já foi resolvido

| # | Pergunta do documento | Resposta já registrada |
|---|---|---|
| 1 | Intervalo fixo ou por posto? | Por turno, default 120min (ADR-0010 #2) |
| 2 | Conta do horário previsto ou do check-in real? | Do horário **previsto**, materializado por cron a partir da escala (`periodic_checkin_expectations.expected_at`) |
| 3 | Tolerância de entrada/periódico? | 5min entrada (`shift_start_expectations.window_min`), régua 15/20min periódico (ADR-0010) |
| 4 | QR fixo ou renovação? | Fixo, risco aceito no protótipo (ADR-0010 #1) — igual ao que o documento já recomendava |
| 5 | Uso manual quando permitido, quem é avisado? | Sempre permitido, marcado "SEM QR" para o supervisor revisar (`checkins_no_qr_idx`) |
| 6 | Áudio original guardado, por quanto tempo? | ❓ ainda em aberto — depende do jurídico (seção 11.5) |
| 7 | Checklist geral vs por posto? | Por posto **e** função (ADR-0010 #4) |
| 8 | Quem confirma/altera gravidade de ocorrência? | ✅ resolvido — `change_incident_status()` + botão "Revisar" no dashboard para `high`/`critical` (migration 12, ADR-0011 #5) |
| 9 | Gestor recebe todo pânico imediatamente? | Sim, supervisor **e** admin, imediato (ADR-0010 #5) |
| 10 | Ação do monitoramento interrompe escalonamento? | Muda a mensagem, não esconde; só resolução para (ADR-0011 #3) |
| 11 | Antecedência mínima do pré-check-out? | Nenhuma — pode ser feito a qualquer momento do turno ativo (ADR-0011 #2) |
| 12-13 | Tempo até monitoramento/gestor serem avisados após pré-checkout? | Reaproveita a mesma régua configurável já decidida (ADR-0011 #2); disparo automático = Sprint 4 |
| 14 | Tempos padrão geral ou por posto? | Por posto, com default geral — mesmo padrão já usado em todo o schema |
| 15 | Check-out final exige presença do próximo colaborador? | Não — sistema não valida presença física, só o check-in de entrada do próximo (ADR-0011 #4) |
| 16 | Como registrar providências durante atraso de rendição? | `acknowledged_at` na expectation (migration 11); UI de reconhecer fica para o cron de Sprint 4 |
| 17 | Falha de internet? | Já resolvido e implementado (fila offline) |
| 18 | Quem consulta/corrige/exporta históricos? | ⚠️ parcial — RLS por papel já existe; export/relatórios avançados fora do escopo atual |
| 19 | Tempo de retenção por tipo de registro? | ❓ mesma pendência jurídica do item 6 |

## Resumo executivo

O rascunho do cliente chega, de forma independente, a conclusões muito
próximas das já registradas nos ADR-0009/0010 (QR opcional, PIN, checklist por
posto+função, periódico "sem novidades", pânico imediato, régua 5/10/15,
offline-first). Isso é um bom sinal de validação cruzada — o produto já
construído está alinhado com o que a operação espera.

Em 2026-07-29, as três lacunas de produto identificadas nesta validação foram
fechadas:

1. **Pré-checkout/aguardando rendição** — implementado (ADR-0011, migration
   11). Falta só o disparo automático de notificação (Sprint 4).
2. **Motivo da entrada fora de escala** — implementado na UI (`checkin/form.tsx`).
3. **Revisão de gravidade alta/crítica pelo supervisor** — implementado
   (migration 12, `change_incident_status`).

Restam de fora, por decisão consciente de escopo ou pendência não-técnica:

- **Retenção de dados / LGPD** — pendência jurídica, não técnica, já
  sinalizada desde o Sprint 1.
- **Disparo automático da régua de alertas (push real)** — Sprint 4, como já
  estava planejado desde o ADR-0010.
- **Fila de prioridade unificada e visão resumida do gestor** — Fase 1.2.

Nenhuma dessas pendências bloqueia a validação do MVP em campo com a RGRS.
