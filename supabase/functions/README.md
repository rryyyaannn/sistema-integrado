# Edge Functions

As Edge Functions (Deno) só entram no **Sprint 4** — ver `docs/10-plano-sprint-1.md`,
seção 4 ("Tarefas que NÃO estão neste sprint").

Esta pasta existe apenas para fixar a estrutura do repositório descrita em
`docs/08-arquitetura-tecnica.md`. As funções planejadas são:

| Função | Disparo | Papel |
|---|---|---|
| `process-audio` | webhook ao subir áudio | Whisper transcreve o áudio |
| `validate-checklist-ai` | encadeada após transcrição | GPT-4o-mini valida o checklist |
| `generate-periodic-expectations` | cron diário | materializa as janelas de check-in periódico |
| `purge-expired-audio` | cron diário | apaga áudios após 90 dias (retenção LGPD) |
| `send-push-notifications` | invocada por triggers/funções | envia push via Expo |

Nenhum código de função foi criado agora, de propósito: o Sprint 1 é fundação.
Adicionar funções aqui antes da hora seria sobreengenharia (risco do Bloco 0).
