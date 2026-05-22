# Sistema Integrado — Documento de Visão e Escopo

**Versão:** 0.1 (rascunho de alinhamento)
**Data:** 13 de maio de 2026
**Status:** Em validação

---

## 1. Visão em uma frase

Construir um ecossistema operacional digital para empresas de terceirização de serviços (portaria, controle de acesso, supervisão, técnicos), centralizando check-ins, ocorrências, checklists e auditoria operacional, com IA assistindo o colaborador de campo via comandos de voz.

## 2. Modelo de produto

**Internal-first, SaaS-ready.**

- **Fase 1 (0–12 meses):** uso interno na própria empresa do fundador como cliente único e validador.
- **Fase 2 (12–24 meses):** após validação operacional e maturidade do produto, evolução para SaaS multi-tenant comercializável para outras empresas do setor.

Decisões arquiteturais são tomadas hoje pensando na Fase 2 sempre que o custo de preparar for baixo. Funcionalidades específicas de SaaS (billing, onboarding self-service, white-label, multi-região) **não são construídas na Fase 1**.

## 3. Público-alvo (personas)

### Persona 1 — Colaborador de Campo (usuário principal do mobile)
- Porteiro, agente de controle de acesso, técnico, serviços gerais
- Baixa familiaridade com tecnologia
- Trabalha em ambiente com conectividade instável
- Usa smartphone Android fornecido pela empresa
- Precisa de interface extremamente simples, com poucos toques e suporte por voz

### Persona 2 — Supervisor Operacional (mobile + web)
- Acompanha múltiplos postos simultaneamente
- Recebe alertas em tempo real
- Aprova/valida ocorrências
- Faz rondas de supervisão

### Persona 3 — Administrador / Gestor (web)
- Configura postos, escalas, checklists
- Acessa dashboards e relatórios
- Faz auditoria operacional
- Cadastra clientes (síndicos / condomínios)

### Persona 4 — Cliente Final / Síndico (Fase 2 — fora do MVP)
- Acessa relatórios filtrados do seu próprio condomínio
- Recebe alertas relevantes

## 4. Escopo do MVP (Fase 1)

### Está dentro
- App mobile Android para colaborador de campo
- Check-in por QR Code do posto
- Checklist operacional na entrada (configurável)
- Registro de ocorrências (texto, foto e áudio)
- Transcrição automática de áudio com validação inteligente do checklist
- Check-ins periódicos (configuráveis por posto)
- Painel web administrativo (cadastros, configurações, visualização)
- Dashboard básico com métricas operacionais
- Relatórios essenciais exportáveis (PDF/CSV)
- Funcionamento offline com sincronização (apenas módulos críticos: check-in e ocorrências)
- Autenticação por usuário/senha + biometria opcional
- Notificações push para supervisores
- Auditoria de ações (quem fez o quê, quando)

### Está fora (Fase 2 ou depois)
- App iOS
- Portal do cliente/síndico
- Billing e onboarding self-service
- White-label
- Multi-idioma
- Integrações com sistemas externos (ERP, folha, ponto eletrônico)
- BI avançado / Data Warehouse
- Reconhecimento facial / biometria avançada
- Geofencing avançado
- Chatbot/IA conversacional ampla
- Rastreamento em tempo real (GPS contínuo)

### Está explicitamente excluído (premissas a confirmar)
- Controle de jornada com valor de ponto eletrônico (questão trabalhista — Portaria 671/2021 do MTE)
- Avaliação de desempenho automatizada por IA (questão jurídica e de relações trabalhistas)

## 5. Stack tecnológica (decidida)

| Camada | Tecnologia | Motivo |
|---|---|---|
| Mobile | Expo (React Native) + TypeScript | Um codebase, build para Android agora, iOS depois |
| Banco + Auth + Storage + Realtime | Supabase Cloud (Pro) | Postgres com RLS, auth pronto, storage para áudios/fotos |
| Web (admin + landing) | Next.js 15 (App Router) + TypeScript | Mesmo time de habilidades do mobile, deploy fácil |
| UI Web | shadcn/ui + Tailwind | Acelera 10x, profissional |
| UI Mobile | NativeWind (Tailwind no RN) | Consistência com web |
| Transcrição de áudio | OpenAI Whisper API | Melhor custo/qualidade para português |
| Validação semântica do checklist | OpenAI GPT-4o-mini (estruturado) | Custo baixo, suficiente para a tarefa |
| Hospedagem web | Vercel (Hobby) | Free tier sustenta MVP |
| Hospedagem mobile (build) | Expo EAS | Free tier para começar |
| Monitoramento de erros | Sentry (free) | Padrão de mercado, free tier generoso |
| E-mail transacional | Resend (free) | 3k/mês grátis |
| Estado/Cache mobile | TanStack Query + MMKV | Cache local + sync offline |
| Banco local offline | WatermelonDB ou SQLite | A definir na fase de arquitetura |
| Push | Expo Push Notifications | Free, multiplataforma |

## 6. Princípios arquiteturais (decididos)

1. **Monolito modular sobre microserviços.** Um único backend (Supabase + Next.js API routes/Edge Functions), com módulos bem separados.
2. **Multitenancy preparado, não ativado.** Toda tabela carrega `tenant_id`. Row Level Security do Postgres garante isolamento. No MVP, existe um único tenant.
3. **Offline-first apenas onde é crítico.** Check-in e ocorrências funcionam offline. O resto exige conexão.
4. **IA é assistente, não decisor.** A IA transcreve e sugere, o colaborador confirma. Nunca a IA "reprova" o colaborador sem revisão humana.
5. **Dados versionáveis.** Todos os registros operacionais são imutáveis (append-only) com correção via novo registro vinculado. Auditoria nativa.
6. **Mobile primeiro em UX.** O app é simples e brutalmente direto. Web é para gestores.
7. **TypeScript em tudo.** Mesmo modelo de dados compartilhado entre web, mobile e backend via tipos gerados do Supabase.

## 7. Orçamento operacional alvo

**Teto de R$ 500/mês** para infra + serviços, durante a Fase 1.

Distribuição esperada:
- Supabase Pro: ~R$ 135
- OpenAI (Whisper + GPT-4o-mini): R$ 50–200 (variável por uso)
- Vercel + Sentry + Resend + Expo: R$ 0 (free tiers)
- Domínio + diversos: R$ 20
- **Folga:** ~R$ 145 para imprevistos e crescimento

## 8. Riscos críticos identificados

| # | Risco | Probabilidade | Impacto | Mitigação inicial |
|---|---|---|---|---|
| R1 | LGPD com gravação de áudio de colaboradores | Alta | Alto | Termo de consentimento explícito + base legal "execução de contrato de trabalho" + DPO designado |
| R2 | Áudio em ambiente ruidoso degrada transcrição | Alta | Médio | UI permite revisão e correção da transcrição antes de submeter |
| R3 | Check-in periódico interpretado como controle de jornada | Média | Alto | Validar com jurídico trabalhista antes do go-live. Não vincular a folha de pagamento. |
| R4 | Celulares da empresa sumindo / uso pessoal | Alta | Médio | Modo kiosk no Expo + lock screen + (futuro) MDM |
| R5 | Conectividade ruim nos postos | Alta | Alto | Offline-first em módulos críticos |
| R6 | Único desenvolvedor (bus factor = 1) | Alta | Crítico | Documentação obrigatória + commits frequentes + repo bem organizado |
| R7 | Custo de IA escala mais rápido que receita | Média | Médio | Cap por tenant + alertas de orçamento na OpenAI |
| R8 | Sobreengenharia matando velocidade | Alta | Alto | Revisão mensal de escopo. Cortar antes de adicionar. |

## 9. Critérios de sucesso da Fase 1

- 100% dos postos da empresa do fundador operando no sistema em até 6 meses
- Redução mensurável de papel/planilhas no operacional
- Tempo de check-in < 60 segundos
- Tempo de registro de ocorrência por áudio < 90 segundos
- Disponibilidade do sistema ≥ 99%
- Custo mensal de infra/serviços ≤ R$ 500
- Pelo menos 2 empresas externas demonstrando interesse formal em usar (sinal verde para Fase 2)

## 10. O que vem a seguir (próximos passos deste documento)

1. **Validação deste documento com o fundador** (etapa atual)
2. Mapa de Módulos com priorização MoSCoW
3. Bloco 2 de perguntas: realidade operacional atual
4. Bloco 3 de perguntas: LGPD, jurídico, restrições
5. PRD detalhado por módulo
6. Modelagem de dados
7. Arquitetura técnica detalhada
8. Roadmap por sprint

---

*Este documento é vivo. Será atualizado a cada decisão estruturante.*
