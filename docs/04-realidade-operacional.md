# Sistema Integrado — Realidade Operacional

**Versão:** 0.1
**Data:** 13 de maio de 2026
**Status:** Em validação

> Este documento consolida o que sabemos sobre a operação real que o sistema vai atender e ajusta as decisões anteriores em função disso. **Substitui parcialmente** o roadmap do documento 03.

---

## 1. Tese de produto (refinada)

> O Sistema Integrado é uma **plataforma de evidência operacional** para empresas de portaria que **permite a um supervisor cobrir 2x mais postos remotamente**, ao mesmo tempo em que **cria histórico imutável** de tudo que aconteceu em cada posto, **protegendo a empresa em questões trabalhistas e de cliente**.

### Como o produto cura cada dor

| Dor | Cura pelo produto |
|---|---|
| 1. Custo de supervisão | Dashboard em tempo real + push em exceções permitem supervisor remoto. Menos visita presencial = mais postos por supervisor. |
| 2. Risco trabalhista (abandono, descuido) | Check-in periódico + geolocalização no check-in + histórico imutável criam evidência objetiva. Sistema não acusa — humano decide com base em dados. |
| 3. Falta de visibilidade em tempo real | Timeline por posto + dashboard + notificações push em exceções. |

### Métricas de sucesso da Fase 1.1

- **Operacional:** 1 supervisor passa a cobrir 8 postos em vez de 5 (em 3 meses de uso)
- **Financeira:** redução de R$ 10.000+/mês em custo de supervisão (após reorganização)
- **Adoção:** 100% dos postos de portaria+SG usando o sistema em 4 meses pós-go-live
- **Qualidade:** 0 incidentes de "perdi a ocorrência" reportados pelo gestor após 30 dias de uso pleno
- **Saúde do sistema:** uptime ≥ 99%, custo de infra ≤ R$ 500/mês

---

## 2. Dimensões operacionais conhecidas

| Atributo | Valor |
|---|---|
| Total de postos | ~35 |
| Portaria + SG | ~25-29 postos (atendidos pelo MVP Fase 1.1) |
| Técnico + Monitoramento | ~6-10 postos (Fase 1.2 ou 2) |
| Supervisores hoje | 7 |
| Razão atual | 1 supervisor : 5 postos |
| Razão alvo | 1 supervisor : 8-10 postos |
| Colaboradores estimados | ~70-90 (escala 12x36, ~2 por posto) |
| Regime predominante | 12x36 com revezamento |
| Tipo de cliente | Condomínios residenciais |
| Celular | Da empresa, **fixo no posto** (não vai com o colaborador) |
| Conectividade | Quase 100% com WiFi do condomínio + 4G corporativo |
| Cobertura territorial | Distribuída por território |

### Implicações técnicas dessas dimensões

1. **Volume de eventos esperado por dia** (estimativa grosseira):
   - 25 postos × 2 check-ins de entrada/saída/dia = 50/dia
   - 25 postos × 6 check-ins periódicos (a cada 2h em 12h) = 150/dia
   - 25 postos × 3 ocorrências/dia média = 75/dia
   - **Total: ~275 eventos/dia, ~8.250/mês, ~100k/ano**
   - **Supabase Pro aguenta com folga.** Postgres não vai sentir.

2. **Volume de áudio estimado:**
   - 50% dos check-ins via áudio × 30 segundos = ~50 minutos/dia
   - **Whisper API:** ~R$ 50/mês
   - **Storage de áudio:** ~1.5 GB/mês × R$ 0,021/GB no Supabase = desprezível
   - Importante: política de retenção (manter áudios por 90 dias? 12 meses? Lembrança da LGPD aqui)

3. **Volume de fotos estimado:**
   - 75 ocorrências × 2 fotos média × 500KB = 75MB/dia, ~2.25 GB/mês
   - **Compressão obrigatória no app antes de upload** (deixar fotos em 800px largura, qualidade 70)

---

## 3. Premissa do dispositivo: celular fixo no posto

**Esta premissa é estruturante e merece destaque.**

### Consequências

- O **app não é pessoal** do colaborador, é **do posto**
- Login por colaborador acontece **a cada plantão** (a cada 12h, ou na troca de turno)
- UX de login **tem que ser brutal de rápida** — meta: 5 segundos com PIN de 4 dígitos
- Identificação confiável do colaborador é crítica → **foto opcional no check-in** (selfie) pra desencorajar que outra pessoa assuma o login
- Recuperação de senha pelo próprio colaborador não funciona (ele não tem app pessoal) → **supervisor reseta senha do colaborador pelo admin web**

### Fluxo de uso por turno (esboço, refinar depois)

```
06:00 — Colaborador do diurno chega ao posto
06:00 — App está aberto na tela "Identificar-se"
06:01 — Colaborador digita matrícula + PIN, tira selfie (≤ 5s total)
06:01 — App mostra "Bom plantão, [Nome]. Faça o check-in do posto."
06:02 — Colaborador escaneia QR Code do posto + faz checklist (digitado ou por áudio)
06:03 — Check-in concluído. App vai pra tela "neutra" com botão grande de "Nova Ocorrência" + lembrete do próximo check-in periódico.
...
14:00 — Push do app: "Check-in periódico das 14h"
14:01 — Colaborador toca, confirma situação do posto em 2 toques (ou áudio)
...
18:00 — Colaborador noturno chega. Diurno faz "encerramento de plantão" (que é um check-out leve).
18:01 — Noturno faz "identificar-se" + check-in de entrada.
```

---

## 4. Decisões revisadas do mapa de módulos

### Mudanças oficiais ao Mapa de Módulos (`02-mapa-de-modulos.md`)

| Módulo | Antes | Depois | Motivo |
|---|---|---|---|
| 10 — Sincronização offline (WatermelonDB) | Must, XL | Should, M | Conectividade boa em quase 100% — cache simples basta |
| 14 — Notificações push | Must, M | **Must, M (subiu prioridade)** | Sem push, supervisor remoto não funciona |
| 13 — Dashboard operacional | Must, M | **Must, L (subiu complexidade)** | É o "centro de comando" do supervisor — UX tem que ser ótimo |
| 17 — Auditoria de ações | Should, M | **Must, M** | Evidência trabalhista exige histórico imutável |
| Geolocalização no check-in | Não existia | **Must, S (novo módulo)** | Comprova presença sem virar GPS contínuo |
| Foto opcional do colaborador no check-in | Não existia | **Should, S (novo módulo)** | Identidade do colaborador no celular compartilhado |
| 8 — Validação semântica por IA | Must, L | Must, L | Mantido — diferencial real |
| Tipos de serviço: Técnico + Monitoramento | Implícito no MVP | **Excluídos do MVP Fase 1.1** | 6-10 postos podem esperar; cabem em Fase 1.2 ou 2 |

### Novo "produto mínimo" da Fase 1.1

Funcionalidades inegociáveis para a Fase 1.1 (em ordem de prioridade):

1. **Identidade & Postos:** cadastro de usuários, postos, escala, QR Code
2. **Check-in com checklist (digitado ou por áudio com IA):** núcleo do app
3. **Geolocalização no momento do check-in:** prova de presença
4. **Check-ins periódicos com push:** redução de necessidade de supervisor presencial
5. **Ocorrências (texto, foto, áudio):** captura de eventos
6. **Dashboard operacional do supervisor:** visibilidade em tempo real
7. **Notificações push em exceções:** supervisor remoto
8. **Auditoria imutável:** evidência trabalhista
9. **Painel admin para cadastros e configurações:** operação do dia-a-dia
10. **Cache local + retry:** resiliência a quedas momentâneas de rede

---

## 5. Roadmap recalibrado — Fase 1.1 (14 semanas)

| Semana | Bloco | Entregável |
|---|---|---|
| 1 | Fundação | Repo, Supabase, deploy, padrões de código, ADR-001 (multitenancy preparado) |
| 2 | Fundação | Modelagem de dados completa + RLS + tipos TypeScript gerados |
| 3 | Identidade | Auth (login por matrícula + PIN), cadastro de colaboradores no admin |
| 4 | Postos | CRUD de postos + geração de QR Code + cadastro de clientes (condomínios) |
| 5 | Checklists | Templates configuráveis de checklist por tipo de posto (portaria/SG) |
| 6 | App mobile base | Setup Expo, login no celular, tela inicial, kiosk mode básico |
| 7 | Check-in | Leitura QR + checklist digitado + envio ao servidor + geolocalização |
| 8 | Ocorrências | Registro texto + foto (com compressão), upload com retry |
| 9 | Áudio + IA (parte 1) | Gravação local + upload + Whisper transcrição |
| 10 | Áudio + IA (parte 2) | GPT-4o-mini valida checklist por voz, alerta itens faltantes |
| 11 | Periódicos + Push | Check-ins por janela de tempo + Expo Push + lembretes |
| 12 | Dashboard | Tela de supervisor: postos hoje, exceções, timeline |
| 13 | Auditoria + Polimento | Log imutável de ações + UI polishing + bug fix |
| 14 | LGPD + Hardening + Piloto | Termos, consentimento, política de privacidade + deploy nos 2 primeiros postos piloto |

### Marco crítico — semana 14

**Vai ao ar nos 2 primeiros postos piloto da sua empresa.** Não é "MVP fechado" — é início de uso real, com você observando de perto. Aprendizado das semanas 15-18 alimenta a Fase 1.2.

---

## 6. Roadmap recalibrado — Fase 1.2 (10 semanas, após 4 semanas de aprendizado)

| Semana (a partir da 19) | Bloco | Entregável |
|---|---|---|
| 19-20 | Ajustes do piloto | Corrigir tudo que doeu nas semanas 15-18 |
| 21-22 | Rollout completo | Expansão para todos os 25-29 postos de portaria/SG |
| 23-24 | Relatórios | Relatórios PDF/CSV para gestão interna |
| 25-26 | Offline-first plena | WatermelonDB + sync (caso ainda seja necessário após a operação real provar a necessidade) |
| 27-28 | Tipo Técnico + Monitoramento | Adicionar os 6-10 postos faltantes (módulo de OS leve + central de eventos leve) |

**Total Fase 1.1 + 1.2 = ~28 semanas (~6,5 meses).** Equivalente ao Cenário B original, mas com **validação real entre as fases** e dor sendo curada em 14 semanas em vez de 24.

---

## 7. Riscos atualizados

| Risco | Estado |
|---|---|
| R1 (LGPD áudio) | **Ativo — bloqueador legal antes do go-live da semana 14** |
| R2 (transcrição em ambiente ruidoso) | Mitigado — UI permite revisão da transcrição |
| R3 (check-in periódico como ponto eletrônico) | **Ativo — validar com jurídico trabalhista em semana 11** |
| R4 (celular sumindo / uso pessoal) | Mitigado parcialmente — kiosk + login a cada plantão |
| R5 (conectividade ruim) | **Rebaixado** — quase 100% têm WiFi do condomínio |
| R6 (bus factor = 1) | Mitigado por documentação contínua + commits frequentes |
| R7 (custo IA escala mais rápido que receita) | Monitoramento mensal — alerta na OpenAI por orçamento |
| R8 (sobreengenharia) | **Ativo — sua tentação de adicionar Técnico/Monitoramento ao MVP é exemplo. Vigiar.** |
| **R9 (novo) — Redução de supervisores não acontecer** | **Ativo — não é problema de software. Plano de gestão de mudança necessário até semana 10.** |
| **R10 (novo) — Identidade do colaborador no celular compartilhado** | Mitigado — PIN + selfie no check-in + auditoria |

---

## 8. Pendências bloqueantes antes de avançar

1. **Você confirmar este documento** (ler e validar)
2. **Bloco 3 — LGPD/jurídico**: termos de consentimento, base legal de tratamento, política de retenção
3. **Conversa com seu jurídico trabalhista** sobre check-in periódico (não bloqueia desenvolvimento, mas bloqueia go-live)
4. **Definir plano de gestão de mudança**: como vai vender pro time de supervisores que eles vão cobrir mais postos remotamente?
5. **Definir 2 postos piloto** — quais são, por que esses, quem opera

---

## 9. O que vem a seguir neste projeto

Próximo entregável (após sua validação deste documento):

**Opção A — Bloco 3 de perguntas (LGPD + jurídico)** → documento `05-lgpd-e-juridico.md`
**Opção B — Modelagem de dados completa** → documento `07-modelagem-de-dados.md` com diagrama ER
**Opção C — Decisões arquiteturais (ADRs)** → começa registro formal das decisões técnicas

Recomendação: **Opção B**. Já temos contexto suficiente pra desenhar o banco, e a modelagem desbloqueia muita coisa em paralelo. LGPD pode ser tratada na semana 13-14 conforme o roadmap.
