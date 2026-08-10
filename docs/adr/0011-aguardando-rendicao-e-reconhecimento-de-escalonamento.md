# ADR-0011 — Aguardando rendição (pré-checkout) e reconhecimento de escalonamento

- **Status:** Aceito
- **Data:** 2026-07-29

## Contexto

Os responsáveis pelo produto enviaram o rascunho funcional "Supervisor Eletrônico
v0.2" (28/07/2026) para validação. Junto veio uma ressalva pontual por áudio: o
documento propõe um **pré-check-out** como gatilho para o monitoramento saber
que o posto está "ocioso", aguardando alguém assumir. Uma pessoa da operação
(Grazi) questionou se isso não seria uma etapa a mais sem necessidade — o
porteiro poderia simplesmente fazer um check-out direto, passando as
informações de pendência de uma vez só.

Esse ponto já tinha sido decidido de outro jeito no
[ADR-0010](0010-decisoes-produto-mvp-porteiro.md) (#7 — "check-out não é
obrigatório para o sistema"). O que estava no ar até esta data
(`apps/mobile/app/(app)/encerrar.tsx`) era exatamente a sugestão da Grazi: uma
única tela, pergunta de pendência de passagem, confirma e fecha o
`shift_session` (`status='closed'`) na hora. Não existia estado intermediário —
o `checkin_purpose` só tinha `entry`/`periodic`/`exit` e o
`shift_session_status` só tinha `active`/`closed`/`abandoned`. A única forma de
o monitoramento saber que um posto ficou descoberto era (a) o cron que encerra
plantão parado como `abandoned` (Sprint 4, ainda não ligado) ou (b)
`shift_start_expectations`, que cobre "o próximo turno não começou no horário
previsto" a partir da escala (`schedules` + `shifts.start_time`).

Este ADR registra a análise das duas posições e a decisão final, tomada em
conjunto com o dono do produto: **implementar o pré-checkout agora**, como
sinalização opcional, em vez de adiar para o Sprint 4.

## Decisão

### 1. Pré-checkout é implementado agora, como sinalização opcional — o check-out direto continua existindo e não muda

`encerrar.tsx` (checkout direto) **continua no app, sem alteração** — resolve a
preocupação da Grazi para quem prefere sair direto, passando pendência de uma
vez. O pré-checkout é uma **ação a mais, não obrigatória**: quem não usa, sai
exatamente como sempre saiu. Isso evita o principal risco que motivava adiar
(reabrir um fluxo já em validação de campo) — nada que já funcionava foi
removido ou reordenado.

### 2. Desenho do delta (implementado na migration `20260729000000_aguardando_rendicao.sql`)

A ideia original (dar ao monitoramento um gatilho proativo de "posto vai
ficar ocioso") resolve uma lacuna real que o modelo anterior tinha: `abandoned`
só era aplicado *depois do fato* (o próximo check-in de entrada ou o cron por
tempo), nunca antes. `shift_start_expectations` cobre parte do problema (turno
seguinte não começou na hora prevista), mas não cobria o caso em que o
porteiro termina e fica esperando sem que o horário previsto do próximo turno
ainda tenha estourado.

Em vez de um novo fluxo de UI obrigatório de duas etapas, o desenho é o menor
delta aditivo possível, seguindo o mesmo padrão que `shift_start_expectations`
já implementou para "não assumiu o posto" (ADR-0009):

- Novo `checkin_purpose = 'pre_checkout'` (evento opcional, não substitui
  `exit`). Reaproveita o mesmo formulário de pendência que `encerrar.tsx` já
  tinha — não é uma tela nova complexa, é o mesmo conteúdo um passo antes,
  disponível como segunda ação na mesma tela.
- `shift_sessions` ganhou a coluna `pre_checkout_at timestamptz` (não um novo
  valor de enum). O estado "aguardando rendição" no dashboard é **derivado**:
  `status = 'active' AND pre_checkout_at IS NOT NULL`. Isso evita reabrir o
  enum `shift_session_status` e mantém `active` como a fonte de verdade de
  "tem alguém no posto".
- Nova tabela `shift_relief_expectations` (mesma forma de
  `shift_start_expectations`: `window_min`, `escalation_level`,
  `fulfilled_by_checkin_id`, `resolved_at`), materializada **pela própria
  trigger** no momento do pré-checkout — diferente de
  `shift_start_expectations`/`periodic_checkin_expectations`, que dependem de
  um cron de materialização (Sprint 4) porque partem de uma previsão de
  escala, aqui o pré-checkout já é o evento real, então a linha nasce na hora.
  Isso responde diretamente à seção 5.7 do documento: uma jornada
  excepcionalmente estendida (8h → 12h) não gera alerta de não-rendição só por
  ter passado da duração normal; o gatilho é sempre o pré-checkout, nunca a
  duração da escala.
- Régua reaproveita os mesmos tempos já decididos em ADR-0010 (configurável
  por posto, default geral), sem inventar uma nova política.
- O check-in de `exit` (check-out final) continua sendo o mesmo evento de
  sempre. A trigger `sync_shift_session` ganhou uma regra a mais: se o próximo
  `entry` no mesmo posto encontra um `shift_session` ativo **com**
  `pre_checkout_at` preenchido, encerra como `closed` (houve aviso prévio,
  handoff esperado) em vez de `abandoned` (que fica reservado para quem
  simplesmente sumiu sem sinalizar nada).

O que **ainda não** existe (fica para Sprint 4, junto do resto da régua de
alertas): o cron/Edge Function que efetivamente dispara a notificação push
quando `shift_relief_expectations` fica pendente além do `window_min`. O dado
e o dashboard já refletem "aguardando rendição" em tempo real (poll); o que
falta é o disparo automático, exatamente como já era o caso para
`shift_start_expectations`/`periodic_checkin_expectations`.

### 3. Ação do monitoramento muda a mensagem do alerta; só uma resolução interrompe o escalonamento

Adota a recomendação do próprio documento (seção 6), sem modificação: sem
nenhuma ação registrada, o alerta escalona como "falta de atendimento"; com
ação registrada mas sem solução, o alerta muda para "em andamento" e **para de
escalar para o próximo nível**, mas continua visível/pendente no painel; só
"resolvido" sai da fila ativa (fica no histórico). A coluna `acknowledged_at`
já foi acrescentada em `shift_start_expectations`, `periodic_checkin_expectations`
e `shift_relief_expectations` (mesma migration). A UI de "reconhecer" no
dashboard fica para quando o cron de Sprint 4 estiver gerando alertas de
verdade — hoje essas tabelas de shift_start/periodic continuam vazias sem o
cron, então não há o que reconhecer ainda ali; `shift_relief_expectations` é
diferente, já recebe linhas reais a partir de agora.

### 4. Check-out final não exige presença do próximo colaborador

O app é individual (login por matrícula+PIN de cada colaborador — ADR-0005),
então o sistema não tem como validar "o próximo chegou" além de um novo
check-in de entrada dele. Confirmação de passagem presencial (os dois no
mesmo lugar confirmando) fica como o próprio documento já sugere: recurso de
etapa seguinte (Fase 1.2), não MVP.

### 5. Revisão de gravidade alta/crítica pelo supervisor (gap correlato, seção 5.5 do documento)

Resolvido na mesma leva de trabalho, via migration
`20260729010000_revisao_status_incidente.sql`: função `change_incident_status`
(`SECURITY DEFINER`) é o único caminho para mudar `incidents.status` — grava
`incident_status_changes` na mesma transação. Isso já estava previsto desde a
migration 04 (comentário "a mudança de status passará por função SECURITY
DEFINER — Sprint 2") e não exigiu nenhuma decisão nova: só faltava construir.
O dashboard usa essa função para o supervisor "revisar" (reconhecer) uma
ocorrência `high`/`critical` aberta.

## Consequências

- O fluxo do porteiro em campo ganha uma ação nova opcional; nada que já
  existia foi removido ou reordenado — risco de retreinar quem já testou é
  baixo.
- A lacuna de visibilidade proativa do monitoramento (o motivo real do áudio)
  está resolvida ponta a ponta no dado e no dashboard; falta só o disparo
  automático de notificação, que anda junto do Sprint 4 como já estava
  planejado para os outros dois tipos de expectativa.
- `abandoned` passa a ter um significado mais limpo: "sumiu sem avisar", não
  mais "não apertou um botão que nem era obrigatório".
- Ocorrências graves/críticas agora têm um caminho real de revisão pelo
  supervisor, fechando uma lacuna que já estava desenhada no schema desde a
  migration 04.

## Alternativas consideradas

- **Adiar o pré-checkout inteiro para o Sprint 4 (decisão original deste ADR
  antes da conversa com o dono do produto).** Reavaliada e substituída: o
  delta é pequeno o bastante (reaproveita o padrão de
  `shift_start_expectations`) e a implementação como ação *opcional* não
  reabre nem arrisca o fluxo já testado — o principal argumento para adiar
  (retrabalho de campo) não se sustentava depois de desenhado o delta.
- **Descartar pré-checkout de vez (seguir só a sugestão da Grazi para
  sempre).** Rejeitada: perde o único sinal proativo de "posto vai ficar
  descoberto" que não depende de a escala do próximo turno estar
  cadastrada — em operações informais/troca de última hora isso importa.
- **Novo valor no enum `shift_session_status` (ex.: `awaiting_relief`) em vez
  de coluna `pre_checkout_at`.** Rejeitada: a coluna é estado derivado mais
  simples de migrar e não força todo `WHERE status = 'active'` existente no
  código a ser reavaliado.
- **Uma ação do monitoramento interrompe o escalonamento por completo (some
  da fila).** Rejeitada: esconderia casos "reconhecidos mas não resolvidos"
  do gestor, que é exatamente o cenário que a seção 6 do documento queria
  evitar.
