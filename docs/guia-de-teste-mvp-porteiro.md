# Guia de teste — MVP do porteiro (Supervisor Eletrônico)

Como exercitar o fluxo ponta a ponta contra o banco real
(`bacxrqrifvqlcztcaizy`). Feito para uma pessoa testando com um celular + um
navegador.

## Credenciais do seed

| Papel | Como loga | Credenciais |
|---|---|---|
| Admin (web) | e-mail + senha | `admin@portaria-modelo.com.br` / `portaria123` |
| Supervisor (web) | e-mail + senha | `supervisor@portaria-modelo.com.br` / `portaria123` |
| Porteiro (mobile) | matrícula + PIN | `P001` (ou `P002`, `P003`) / `1234` |

## Subir os apps

**Web (painel):**
```bash
corepack pnpm --filter web dev      # http://localhost:3000
```
Ou use a URL de **preview da Vercel** gerada pelo PR desta branch.

**Mobile (app do porteiro):**
```bash
corepack pnpm --filter mobile start  # abre o Metro + QR do Expo
```
Abra o **Expo Go** no celular e escaneie o QR do Metro. (Geolocalização e câmera
funcionam no Expo Go; o app vai pedir as permissões na primeira vez.)

## Roteiro ponta a ponta (~5 min)

1. **Web — abrir o painel.** Logue como admin. O dashboard mostra **3 postos
   aguardando check-in** (a escala de hoje do seed) e tudo o mais zerado.

2. **Mobile — assumir posto.** Logue como `P001` / `1234`. A home mostra "nenhum
   plantão ativo" e sua escala. Toque **Assumir posto**:
   - **Sem QR:** toque no posto da sua escala → confirma → plantão aberto (fica
     marcado "Sem QR").
   - **Com QR:** toque **Escanear QR Code** e aponte para um QR do posto. Para
     gerar um QR na tela, no web vá em **Postos → (um posto) → QR**, ou use o
     token do seed (`pt_seed_acacias_principal`, etc.).

3. **Web — ver o plantão ao vivo.** Em até 5s, **Plantões ativos** mostra o posto
   com o porteiro e o horário; **Postos aguardando** cai de 3 para 2.

4. **Mobile — check-in periódico.** Na home (plantão ativo) → **Check-in
   periódico** → *Sim, tudo normal*. (Ou *Não, há pendência* + nota.)

5. **Mobile — ocorrência.** **Registrar ocorrência** → escolha uma categoria
   (pré-preenche a gravidade), ajuste, descreva → **Registrar**. No web,
   **Ocorrências abertas** mostra o item com a etiqueta de gravidade.

6. **Mobile — pânico.** **Pânico** → **Acionar** → confirme. No web, um **banner
   vermelho** aparece no topo do dashboard e o pânico fica fixado no topo das
   ocorrências. (Este é o teste do alerta crítico.)

7. **Mobile — encerrar plantão.** **Encerrar plantão** → responda "pendências
   para o próximo turno?" → **Confirmar check-out**. No web, o plantão sai de
   "ativos" e o posto volta para "aguardando".

## O que observar

- **Geolocalização:** cada check-in captura a posição. Se você estiver longe das
  coordenadas do posto (seed usa São Paulo), o check-in registra "fora do raio" —
  isso é esperado e aparece no feed de **Check-ins** do web.
- **Offline:** ligue o modo avião no meio de um check-in — ele é enfileirado no
  app e reenviado sozinho quando a rede volta (a home mostra "pendente de envio").
- **Esqueceu o check-out:** se `P001` assumir de novo o mesmo posto sem encerrar,
  o plantão anterior vira `abandoned` automaticamente (trigger).

## Ainda NÃO ligado nesta fatia (ver ADR-0008)

- **Disparo automático de alertas** (push quando não assume/não faz periódico):
  as expectativas são materializadas, mas o cron + Edge Function que enviam o
  push são Sprint 4. Por ora o monitoramento é ativo (olho no painel).
- **Resposta à ocorrência/pânico no web** (marcar reconhecido/resolvido): Sprint 2+.
- **Checklist item-a-item** na entrada: Sprint 3 (hoje grava o template como snapshot).

## Revalidar o banco a qualquer momento

```bash
node scripts/verify-db.mjs         # schema, RLS, ciclo de plantão
node scripts/verify-login.mjs      # login dos 3 papéis + claims do JWT
node scripts/verify-dashboard.mjs  # queries do painel sob RLS de admin
```
