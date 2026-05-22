# ADR-0004 — Offline com MMKV em vez de WatermelonDB na Fase 1.1

- **Status:** Aceito
- **Data:** 2026-05-14

## Contexto

O briefing original previa um app *offline-first* pleno, com banco local
sincronizado via **WatermelonDB**. Esse é o módulo mais arriscado e caro do
projeto — a estimativa é de quase 3 semanas só para ele.

O documento de realidade operacional (doc 04) trouxe um dado que muda a conta:
os postos têm conectividade boa em quase 100% dos casos (WiFi do condomínio +
4G corporativo). O celular é fixo no posto, não acompanha o colaborador.

## Decisão

Na **Fase 1.1**, o app não é offline-first pleno. Usa **cache otimista + fila de
retry** sobre **MMKV** (armazenamento local rápido):

- Check-in e ocorrência são gravados numa fila local e reenviados ao reconectar.
- Upload de mídia roda em segundo plano com retry exponencial.
- Idempotência via UUID v7 (ver ADR-0002) impede duplicação no reenvio.

WatermelonDB fica **adiado para a Fase 1.2**, e só será construído se a operação
real provar que algum posto tem conectividade ruim o bastante para justificá-lo.

## Consequências

- Economia de ~3 semanas no cronograma da Fase 1.1.
- O módulo mais arriscado tecnicamente é construído **depois** de já haver
  usuários reais — que dirão exatamente o que precisa sincronizar.
- O cache simples **não** resiste a horas offline: a fila pode crescer e há risco
  de perda de dados se o app for fechado nesse estado (ver doc 08, seção 5).
- Pode ser necessário fazer o upgrade para WatermelonDB na Fase 1.2 — é um
  caminho previsto, não um retrabalho surpresa.

## Alternativas consideradas

- **WatermelonDB já na Fase 1.1.** Rejeitada: investiria 3 semanas no módulo
  mais arriscado antes de qualquer validação com usuários reais. Faseado é mais
  barato de pivotar (ver doc 03, Cenário C).
