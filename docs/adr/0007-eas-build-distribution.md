# ADR-0007 — Distribuição do app de campo via EAS Build (preview interno)

- **Status:** Aceito
- **Data:** 2026-05-25

## Contexto

O sócio do dono da empresa precisa testar o app de campo em um celular Android
real, e o ciclo Expo Go + LAN não escala: exige o testador na mesma rede,
não permite features que dependem de código nativo (câmera de QR Code, fila
local persistente, MMKV) e não tem versão estável instalada no aparelho.

Precisamos de um canal que entregue um **APK assinado, instalável e
atualizável remotamente**, sem custo extra de infraestrutura.

## Decisão

Usar **EAS Build (Expo Application Services)** com três profiles em
`apps/mobile/eas.json`:

- `development` — dev client com inspector (uso interno do desenvolvedor).
- `preview` — APK assinado para distribuição interna, sem Play Store. Canal
  EAS Update `preview` para receber correções OTA sem rebuild.
- `production` — APK assinado para uso real nos postos, canal EAS Update
  `production`, `autoIncrement` ligado para o `versionCode` Android.

O sócio recebe um link EAS válido por 30 dias, instala o APK como qualquer
app de fora da Play Store ("Permitir instalação de fontes desconhecidas") e,
dali em diante, recebe updates de JavaScript automaticamente via OTA toda
vez que o desenvolvedor rodar `eas update --branch preview`.

Mudanças de código nativo (libs com bindings, novos plugins do Expo)
continuam exigindo um novo APK — geramos com `eas build -p android --profile preview`.

## Consequências

- Distribuição **gratuita** no plano free do EAS (30 builds/mês), suficiente
  para o slice e para a Fase 1.1.
- O testador não precisa de Expo Go, não precisa estar na mesma rede,
  recebe as features completas (câmera, MMKV no futuro, módulos nativos).
- Updates OTA são quase instantâneos para mudanças de JavaScript — feedback
  loop rápido.
- O APK do canal `preview` **não** vai para a Play Store. Esse é o ponto:
  durante a Fase 1.1, nada da operação real depende da Play Store.
- Quando virar produção em escala, considerar Play Store internal testing
  como evolução natural do canal `preview`.

## Alternativas consideradas

- **Expo Go puro durante todo o slice.** Rejeitada: `expo-camera` não roda
  em Expo Go sem dev client, e o sócio precisa ter o aparelho na mesma rede
  do dev — inviável para entrega remota.
- **Play Store internal testing direto.** Rejeitada para o slice: cria
  fricção com termos de uso da Play, exige conta paga de Play Console
  ($25 uma vez), e não há necessidade real ainda — o canal `preview` do EAS
  cobre exatamente este caso de uso.
- **Distribuir APK por canal próprio (S3, GitHub Releases).** Rejeitada:
  perderia OTA Update integrado, e o EAS Build já assina o APK e hospeda o
  link sem custo adicional.
