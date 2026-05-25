# Sistema Integrado — Guia do testador

Bem-vindo. Este documento é seu manual para instalar e usar o app de campo
durante o teste. Leva uns 10 minutos.

## O que você está testando

Um app Android usado pelo porteiro no celular do posto. Fluxo principal:

1. O porteiro chega ao posto.
2. Faz login com **matrícula** e **PIN**.
3. Toca em **"Fazer check-in"** → app abre a câmera.
4. Escaneia o **QR Code** que está afixado no posto.
5. Confirma. Pronto — o check-in chega instantaneamente no painel web do supervisor.

Se a internet cair, o app **enfileira** o check-in e reenvia automaticamente
quando voltar online. Você não perde nada.

## Conta de teste

| Papel | Login | Senha/PIN |
|---|---|---|
| Colaborador 1 (Carlos Porteiro) | `P001` | `portaria123` |
| Colaborador 2 (Daniela Vigilante) | `P002` | `portaria123` |
| Colaborador 3 (Eduardo Serviços) | `P003` | `portaria123` |

Pode usar qualquer um. São colaboradores fictícios criados pelo seed.

## Instalando o APK no Android

1. **Receba o link** do APK pelo WhatsApp (te mando assim que o build sair).
2. Abra o link no Android.
3. Ao baixar, o Android perguntará se quer instalar apps de fontes desconhecidas.
   - Toca em **"Configurações"**.
   - Ativa **"Permitir desta fonte"** (geralmente o Chrome ou Drive).
   - Volta e instala.
4. Abre o app.

> Se o Android avisar **"Play Protect bloqueou um app desconhecido"**, toca em
> **"Instalar mesmo assim"**. É só porque o app não está na Play Store ainda.

## Fluxo nuclear do teste

1. Tela inicial: **"Identificar-se"**.
   - Digite **P001** na matrícula.
   - Digite **portaria123** no PIN.
   - Toca em "Entrar".
2. Tela home: **"Bom plantão, Carlos Porteiro"**.
3. Toca **"Fazer check-in"**.
4. Permite o acesso à câmera (uma vez só).
5. Aponta para o QR Code de um posto. Te mando uma imagem por WhatsApp para
   você escanear da tela do PC, ou cole o QR num papel se preferir.
   - QR Codes vivem em: `https://sistema-integrado-rryyyaannns-projects.vercel.app/app/postos` → "Ver QR" em cada posto.
6. Confirma o check-in.
7. Vê a mensagem **"Bom plantão"**.

## Como dizer ao dev "achei um problema"

Em vez de WhatsApp solto, abra uma issue no GitHub:

1. Vai em https://github.com/rryyyaannn/sistema-integrado/issues/new
2. Título curto e específico: `[bug] tela X mostra Y quando deveria Z`
3. Corpo: o que você fez, o que esperava, o que aconteceu, screenshot/print.

Se for crítico (não dá pra continuar testando), pode mandar WhatsApp também
— mas registra a issue para não esquecer.

## Limitações conhecidas (não reportar como bug)

Este é um teste de fluxo nuclear, com várias features ainda em construção:

- ❌ Ainda **não tem** registro de ocorrências (texto/foto/áudio).
- ❌ A IA ainda **não valida** o checklist por voz.
- ❌ **Não tem** push notification para o supervisor.
- ❌ **Não tem** check-ins periódicos automáticos.
- ❌ **Não tem** dashboard com gráficos.

Tudo isso entra nas próximas 8 semanas (Sprint 3+).

## O que sim deve funcionar

- Login com matrícula + PIN.
- Escanear QR Code do posto.
- Registrar check-in de entrada.
- Ver o check-in aparecer no painel web em ~5 segundos.
- Modo avião: check-in fica pendente, sincroniza ao reconectar.
- Logout (no botão "Sair do plantão" na home).

## Painel web

Disponível em: `https://sistema-integrado-rryyyaannns-projects.vercel.app`

Você pode logar como **supervisor**:
- Email: `supervisor@portaria-modelo.com.br`
- Senha: `portaria123`

Ou como **admin**:
- Email: `admin@portaria-modelo.com.br`
- Senha: `portaria123`

Páginas a usar:
- `/app/postos` — lista dos 5 postos com seus QR Codes.
- `/app/checkins` — dashboard live, atualiza a cada 5 segundos.

## Atualizações futuras do APK

Depois do primeiro APK instalado, mudanças que **não** mexem em código nativo
chegam automaticamente via OTA (Over-The-Air): você fecha e abre o app de
novo, e a versão nova está lá. Não precisa reinstalar.

Mudanças nativas (raras) exigem novo APK — te mando link novo.

## Dúvidas

Qualquer coisa fora desse guia, me chama. Obrigado por testar.
