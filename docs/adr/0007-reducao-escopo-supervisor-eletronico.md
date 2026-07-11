# ADR-0007 — Redução de escopo para "Supervisor Eletrônico para Porteiros"

- **Status:** Aceito
- **Data:** 2026-07-11

## Contexto

A Fase 1.1 vinha modelada como um MVP amplo (ver docs 01/02/07). Para acelerar a
validação com o cliente real (RGRS), o escopo inicial foi **reduzido** ao núcleo
que prova valor: garantir que o porteiro **assumiu o posto, permaneceu ativo,
reportou o posto, registrou problemas e a gestão foi alertada** quando algo saiu
do esperado. Cinco frentes: (1) app do porteiro, (2) check-in de assumir posto,
(3) check-in periódico, (4) ocorrências + botão de pânico, (5) painel de
monitoramento.

**Achado que guiou este ADR:** o schema das migrations 01–09 já cobria ~85% desse
escopo enxuto (`checkins` entry/periodic/exit, `incidents`, `checklist_templates`,
`media_files`/`audio_transcriptions`, `notifications`, `periodic_checkin_expectations`).
A decisão foi **não recriar nada** — só acrescentar o delta que faltava. O banco
foi zerado em 2026-07-11 e será repovoado aplicando as migrations existentes + o
delta (migration `20260701000000`).

## Decisão

### 1. Plantão como entidade de primeira classe (`shift_sessions`)

O check-in de entrada **abre** um plantão; o de saída **encerra**. Sem essa
entidade, "plantão ativo", o dashboard e o caso "esqueceu o check-out" virariam
consultas frágeis de *entry-sem-exit*. O ciclo de vida (`active` → `closed` /
`abandoned`) é gerido por trigger `SECURITY DEFINER` no `INSERT` de `checkins`
(mesmo padrão de `handle_new_user`), então o app só insere check-ins. Um novo
check-in de entrada num posto com plantão ativo órfão encerra o anterior como
`abandoned` — resolve a troca de turno sem check-out e o "esqueceu o check-out"
(cron pode fazer o mesmo por tempo).

### 2. Botão de pânico **reusa** `incidents` (flag `is_panic`)

Em vez de tabela dedicada `panic_alerts`. Um pânico é um `incident` com
`is_panic=true`, `severity='critical'`, sem formulário obrigatório. Vantagem: o
**protocolo de resposta** (quem reconheceu / resolveu e quando) sai de graça via
`incident_status_changes` (append-only), e a timeline/dashboard ficam unificadas.
O disparo do alerta crítico é responsabilidade da Edge Function/cron, não do
schema.

### 3. Canal de alerta no MVP = **só push (Expo)**

O roadmap Cenário A já adiava push para supervisores; a spec do rework pedia
push + WhatsApp. Para o MVP enxuto fica **só push** (`push_tokens` já existe,
custo zero por mensagem, cabe no teto de R$ 500/mês). WhatsApp Business API
(custo por conversa + setup de API oficial) e e-mail ficam para a Fase 1.2.

### Delta de schema (migration `20260701000000`)

- `shift_sessions` (plantão) + trigger `sync_shift_session`.
- `checkins`: `validation_method` (`qr` | `button` — "SEM QR"), `qr_token_used`,
  `shift_session_id`.
- `incidents`: `is_panic`, `shift_session_id`.
- `shift_start_expectations` (régua "não assumiu o posto") + `escalation_level` /
  `resolved_at` em `periodic_checkin_expectations` (régua "não fez o periódico").

### Decisões operacionais já resolvidas (não travam schema)

- **QR opcional:** botão é a ação principal; QR confirma o local se disponível;
  sem QR o check-in é aceito e marcado como `button` ("SEM QR") para auditoria.
- **Periodicidade padrão:** 120 min, configurável por turno
  (`shifts.periodic_checkin_interval_min`).
- **Checklist por posto E por função:** já suportado (template por `service_type`
  + `post_checklist_assignments` por posto/turno/propósito).
- **Check-out não é obrigatório para o sistema:** o cron auto-encerra plantão
  parado como `abandoned` e sinaliza para o supervisor.

## Consequências

- Retrabalho evitado: reaproveita 9 migrations já escritas e testadas em padrão.
- O plantão vira o eixo do dashboard e da passagem de serviço.
- `shift_sessions` é a única tabela do domínio operacional com `UPDATE` (ciclo de
  vida) — exceção consciente ao append-only do ADR-0002, restrita à trigger e ao
  `service_role`; os check-ins que a alimentam continuam imutáveis.
- Fica dívida explícita para a Fase 1.2: WhatsApp/e-mail, `post_evaluations`
  (avaliação semanal/mensal) e validação semântica por IA (módulo 8).

## Alternativas consideradas

- **Reconstruir o schema do zero para o escopo enxuto.** Rejeitada: jogaria fora
  trabalho pago e testado; o existente já servia com um delta pequeno.
- **`panic_alerts` dedicada.** Rejeitada: duplicaria timeline, dashboard e lógica
  de resposta para um evento raro (ver decisão 2).
- **Derivar o plantão de `checkins` (sem `shift_sessions`).** Rejeitada:
  empurraria complexidade para toda consulta de dashboard e tornaria ambíguo o
  "esqueceu o check-out" (ver decisão 1).
- **WhatsApp desde o MVP.** Rejeitada por ora: custo por conversa + setup de API
  oficial pressionam o teto de R$ 500 antes de haver validação (ver decisão 3).
