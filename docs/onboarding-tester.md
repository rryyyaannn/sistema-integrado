# Sistema Integrado — Guia do testador

Bem-vindo. Este documento é o seu manual para testar o **Supervisor Eletrônico**:
o app que o porteiro usa no posto e o painel que o monitoramento acompanha em
tempo real. Leva uns 15 minutos.

> Última atualização: 10/08/2026. O que está aqui é o que existe hoje — não é
> promessa de roadmap.

## O que você está testando

Duas pontas conversando com o mesmo banco:

| Onde | O quê | Quem usa |
|---|---|---|
| **App Android** | Assumir posto, check-in periódico, ocorrência, pânico, encerrar plantão | Porteiro, no celular do posto |
| **Painel web** | Plantões ativos, ocorrências abertas, postos aguardando, pânico em destaque | Monitoramento / supervisor, no navegador |

O painel atualiza sozinho a cada 5 segundos. A ideia do teste é você ver o que
faz no celular aparecer no navegador quase na hora.

## Contas de teste

Tudo é dado fictício de uma empresa de exemplo ("Portaria Modelo").

| Papel | Onde loga | Login | Senha / PIN |
|---|---|---|---|
| Porteiro | App Android | `P001` | `1234` |
| Porteiro | App Android | `P002` | `1234` |
| Porteiro | App Android | `P003` | `1234` |
| Admin | Painel web | `admin@portaria-modelo.com.br` | `portaria123` |
| Supervisor | Painel web | `supervisor@portaria-modelo.com.br` | `portaria123` |

O ideal é abrir o painel no computador e ficar com o celular do lado.

## 1. Painel web

Abra no navegador: **https://sistema-integrado-chi.vercel.app**

Logue como **admin**. Você cai no painel de monitoramento. Páginas:

- `/app` — o monitoramento em si (plantões ativos, ocorrências, escala do dia).
- `/app/postos` — os 5 postos cadastrados; cada um tem um **QR Code** para
  imprimir ou mostrar na tela.
- `/app/checkins` — o histórico de check-ins, com localização.

Ao abrir pela primeira vez você deve ver **3 postos aguardando check-in** (a
escala de hoje) e nenhum plantão ativo.

## 2. App do porteiro (Android)

1. Abra este link **no próprio Android**:
   https://expo.dev/accounts/ryanmaciel18/projects/sistema-integrado/builds/09922604-6624-4a74-86ca-aabaed7774ac
   (ou baixe direto: https://expo.dev/artifacts/eas/MU8uxVYI-7Y4utrU8BNjbrOxUOFROxJPfwHAaonnnKM.apk)
2. Toque em **Install** / baixe o `.apk`.
3. O Android vai perguntar se pode instalar de fonte desconhecida:
   - toque em **Configurações** → ative **Permitir desta fonte** → volte e instale.
4. Se aparecer **"Play Protect bloqueou um app desconhecido"**, toque em
   **Instalar mesmo assim**. É só porque o app ainda não está na Play Store.
5. Abra o app e permita **câmera** e **localização** quando ele pedir. Ele só usa
   a localização no momento do registro — não há rastreamento contínuo.

## 3. Roteiro do teste (~10 min)

### Passo 1 — Entrar

Tela **Identificar-se**: matrícula `P001`, PIN `1234`.
A home mostra **"Nenhum plantão ativo"** e a sua escala do dia.

### Passo 2 — Assumir o posto

Toque em **Assumir posto**. Dois caminhos:

- **Com QR Code (o jeito certo):** toque em **Escanear QR Code** e aponte para o
  QR do posto. Pegue o QR no painel web em `/app/postos` → "Ver QR" (pode
  escanear direto da tela do computador).
- **Sem QR:** toque no posto da sua escala e confirme. O registro é aceito, mas
  fica **marcado para conferência** — é assim de propósito.

👉 **No painel:** em até 5 segundos aparece um **plantão ativo** com seu nome e o
horário, e "postos aguardando" cai de 3 para 2.

### Passo 3 — Check-in periódico

Na home (agora com plantão ativo) → **Check-in periódico** → responda
**"Está tudo normal no posto?"** com *Sim, tudo normal* ou *Não, há pendência*
(neste caso escreva o que houve).

👉 **No painel:** o registro entra no histórico em `/app/checkins` com a posição.

### Passo 4 — Registrar uma ocorrência

**Registrar ocorrência** → escolha uma categoria (ela já sugere a gravidade) →
ajuste se quiser → descreva → **Registrar**.

👉 **No painel:** a ocorrência aparece em "Ocorrências abertas" com a etiqueta de
gravidade. Se for **alta** ou **crítica**, o monitoramento pode marcar como
**revisada** ali mesmo — faça isso e veja o item sair da lista.

### Passo 5 — Pânico

Botão vermelho **PÂNICO** → **Acionar** → confirme.

👉 **No painel:** um **banner vermelho** aparece no topo e o pânico fica fixado
como primeiro item das ocorrências. Este é o teste mais importante do alerta
crítico.

### Passo 6 — Encerrar o plantão

**Encerrar plantão**. Aqui há duas opções, e vale testar as duas em rodadas
diferentes:

- **Avisar e aguardar rendição** (botão âmbar): avisa o monitoramento de que você
  terminou mas ainda está no posto esperando quem vai render. **O plantão
  continua ativo.** No painel o posto passa a aparecer como *aguardando rendição*.
- **Confirmar check-out** (botão branco): encerra de vez. Antes, responda
  *"Há pendências para o próximo turno?"* — é a passagem de serviço.

👉 **No painel:** o plantão sai de "ativos" e o posto volta para "aguardando".

## 4. Coisas que valem testar de propósito

- **Modo avião no meio de um registro.** O app enfileira e a home mostra
  "pendente de envio". Volte a rede: ele reenvia sozinho (ou toque em
  "Tentar reenviar agora").
- **Longe do posto.** Os postos do teste têm coordenadas em São Paulo. Se você
  estiver longe, o registro é aceito e marcado **"fora do raio"** — aparece assim
  no painel. É o comportamento esperado, não é bug.
- **Esquecer o check-out.** Assuma um posto, feche o app e assuma de novo sem
  encerrar: o plantão anterior é fechado automaticamente como **abandonado**.
- **Rendição de verdade.** Faça `P001` avisar rendição e, logo depois, entre com
  `P002` e assuma o mesmo posto. O plantão do `P001` fecha como **encerrado**
  (não como abandonado), porque houve aviso.

## 5. O que ainda NÃO existe (não reportar como bug)

- **Push / alerta automático.** O sistema já sabe quem deveria ter assumido e
  quem deveria ter feito o periódico, mas ainda **não envia** notificação quando
  isso não acontece. Hoje o monitoramento é olho no painel. (Sprint 4)
- **Checklist item a item** na entrada do posto. Hoje o app grava o modelo do
  checklist, mas não pergunta item por item. (Sprint 3)
- **Foto, áudio e IA** na ocorrência. Hoje é texto. (Sprint 3+)
- **Relatórios e gráficos.** O painel é operacional, ao vivo — não é BI ainda.
- **iPhone.** Só Android por enquanto.

## 6. Como reportar um problema

Abra uma issue: https://github.com/rryyyaannn/sistema-integrado/issues/new

- Título curto e específico: `[bug] tela X mostra Y quando deveria Z`
- No corpo: o que você fez, o que esperava, o que aconteceu, print da tela.
- Diga também **qual conta** (P001? admin?) e **que horas** foi — ajuda a achar
  o registro no banco.

Se for crítico (travou, não dá para continuar), me chama no WhatsApp também —
mas registre a issue depois para não perder.

## 7. Atualizações do app

Mudanças que não mexem em código nativo chegam **sozinhas**: feche e abra o app,
a versão nova está lá. Quando precisar de APK novo, te mando link.

---

**Notas para o dev:**

- A escala do seed é gravada com a data do dia em que o seed rodou. Antes de cada
  sessão de teste, rode `node scripts/preparar-demo.mjs` para trazer a escala
  para hoje e encerrar plantões pendurados de dias anteriores.
- O link do APK acima é do build EAS `09922604` (canal `preview`, commit
  `cec4c7e`). A URL do artifact vale 30 dias; a página do build continua servindo
  o install depois disso. Para gerar outro, `/eas-preview`.
- O banco é free tier: pausa sozinho depois de ~7 dias sem uso e o app passa a
  dar erro de conexão. `preparar-demo.mjs` serve de ping — se falhar, religue o
  projeto no dashboard do Supabase antes de avisar o testador.
