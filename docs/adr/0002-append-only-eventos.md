# ADR-0002 — Eventos operacionais são append-only

- **Status:** Aceito
- **Data:** 2026-05-14

## Contexto

O sistema é, na essência, uma **plataforma de evidência operacional**. Check-ins
e ocorrências podem ser usados em questões trabalhistas e em disputas com
clientes. Se um registro pudesse ser editado ou apagado, ele perderia valor como
prova — e a empresa perderia a proteção que o sistema promete dar.

## Decisão

As tabelas de eventos operacionais (`checkins`, `incidents`,
`incident_status_changes`, `audit_log`, transcrições, validações de IA) são
**append-only**:

- Não têm `updated_at` nem `deleted_at`.
- A RLS não concede `UPDATE` nem `DELETE` ao usuário — só `INSERT` e `SELECT`.
- Correção de um registro = **novo registro** apontando para o original via
  `corrects_id`.
- A única exceção é `incidents.status`, e mesmo assim a mudança gera uma linha
  nova em `incident_status_changes` (que também é append-only).

A chave primária é **UUID v7**, gerado no cliente. Por ser ordenável por tempo,
serve de chave de idempotência: o servidor faz `INSERT ... ON CONFLICT DO
NOTHING`, então um reenvio após falha de rede não duplica o registro.

## Consequências

- Auditoria nativa e histórico imutável — proteção jurídica real.
- Idempotência de graça nos envios offline/retry.
- Mais linhas no banco (correções acumulam). Estimativa do doc 07 mostra que
  cabe folgado no Supabase Pro.
- Toda leitura precisa considerar a "versão mais recente" de uma cadeia de
  correções — um pouco mais de lógica nas consultas.

## Alternativas consideradas

- **`UPDATE` in-place + tabela de auditoria separada.** Rejeitada: é fácil
  esquecer de registrar a auditoria, e um `DELETE` ainda apagaria a evidência.
  Append-only torna a imutabilidade uma propriedade do schema, não da disciplina.
