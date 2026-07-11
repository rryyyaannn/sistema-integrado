# ADR-0008 — Decisões de produto do MVP do porteiro

- **Status:** Aceito
- **Data:** 2026-07-11

## Contexto

O levantamento do Supervisor Eletrônico (ver [ADR-0007](0007-reducao-escopo-supervisor-eletronico.md))
deixou uma lista de decisões em aberto. Como o produto ainda está sendo
validado com a RGRS, elas foram resolvidas com os caminhos mais simples que
provam valor, **reversíveis** se a operação real mostrar outro melhor. Este ADR
registra o que foi decidido e implementado nesta fatia (fluxo do porteiro no
mobile + dashboard de monitoramento no web).

## Decisões

### 1. QR é **opcional**; o botão vale sozinho

Assumir o posto é feito por botão. O QR do posto, quando disponível, é a
evidência forte do local (`validation_method='qr'`, `qr_token_used` gravado). Sem
QR, o check-in **é aceito** e marcado `validation_method='button'` ("SEM QR") para
o supervisor conferir. A geolocalização é **sempre** capturada no instante do
check-in (nunca em background — LGPD). Não travamos a operação por falta de QR.

### 2. Periodicidade padrão do check-in periódico: **120 min**, por turno

`shifts.periodic_checkin_interval_min` (default 120). Ajustável por posto/turno.
O periódico é deliberadamente **rápido** ("Está tudo normal?" → Sim / Não com
nota) — só abre campos extras se houver pendência.

### 3. Régua de alertas e **quem recebe cada um** (MVP = só push)

Canal do MVP é **push (Expo)** — WhatsApp/e-mail ficam para a Fase 1.2 (ADR-0007,
teto R$ 500). Mapeamento de papéis: **"monitoramento" = `supervisor`**,
**"gerente operacional" = `admin`** do tenant.

| Evento | +T | Quem |
|---|---|---|
| Não assumiu o posto (escala prevista) | +5 min | supervisor (monitoramento) |
| | +10/15 min | admin (gerente) |
| Não fez o periódico | +15 min | supervisor |
| | +20 min | admin |
| Botão de pânico | imediato | supervisor **e** admin |
| Ocorrência `high`/`critical` (categoria com `notify_supervisor`) | imediato | supervisor |

As expectativas já são materializadas (`shift_start_expectations`,
`periodic_checkin_expectations` com `escalation_level`). **O disparo em si (cron +
Edge Function send-push-notifications) é Sprint 4** — o schema e o dashboard já
suportam; o envio automático ainda não está ligado.

### 4. Checklist: **por posto E por função**

Já suportado — template por `service_type` (função) + `post_checklist_assignments`
por posto/turno/propósito. Renderização item-a-item do checklist é Sprint 3;
nesta fatia o check-in grava o template resolvido como snapshot.

### 5. Botão de pânico aciona supervisor **e** admin, imediato

Reusa `incidents` (`is_panic=true`, `severity='critical'`, sem formulário — só uma
confirmação para evitar disparo acidental). Aparece em **destaque no dashboard**
(banner vermelho + fixado no topo). Protocolo de resposta via
`incident_status_changes` (Sprint 2+ no web).

### 6. Ocorrência já tem **níveis de gravidade** no MVP

`incident_severity` (baixa/média/alta/crítica). A categoria escolhida pré-preenche
a gravidade padrão, editável pelo porteiro.

### 7. Check-out **não** é obrigatório para o sistema

O porteiro é incentivado a encerrar (passagem de serviço: "há pendências para o
próximo turno?"), mas se esquecer: um **novo check-in de entrada no mesmo posto**
encerra o plantão anterior como `abandoned` (trigger), e um **cron** (Sprint 4)
encerra plantões parados além do fim do turno. O dashboard mostra o plantão como
ativo até isso acontecer.

### 8. Ocorrência e pânico exigem **plantão ativo**

Ambos precisam de um posto de referência; o porteiro assume o posto primeiro.
A home só mostra esses botões quando há plantão ativo. (Se a operação pedir
pânico "antes de assumir", revisitar — é reversível.)

## Consequências

- O porteiro consegue completar o ciclo inteiro no app: assumir → periódico →
  ocorrência → pânico → encerrar, com geo e evidência.
- O dashboard reflete o estado real em tempo real (poll 5s).
- Fica explícito o que **ainda não** dispara sozinho: a régua de alertas depende
  do cron/Edge Function (Sprint 4). Até lá, o monitoramento é ativo (olho no
  painel), não por notificação automática.

## Alternativas consideradas

- **QR obrigatório.** Rejeitada: trava a operação onde o QR foi removido/danificado;
  auditoria via "SEM QR" + geo cobre o risco.
- **Periódico como checklist longo.** Rejeitada: o porteiro resiste ao que é lento;
  o levantamento é explícito nisso.
- **WhatsApp desde o MVP.** Adiada (custo + API oficial), ver ADR-0007.
