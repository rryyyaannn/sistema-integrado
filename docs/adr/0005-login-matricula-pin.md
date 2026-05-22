# ADR-0005 — Login do colaborador por matrícula + PIN

- **Status:** Aceito
- **Data:** 2026-05-14

## Contexto

O celular é **fixo no posto** e **compartilhado**: o app não é pessoal do
colaborador, é do posto. A cada troca de plantão (a cada 12h) um colaborador
diferente assume o aparelho. O login precisa ser brutalmente rápido — meta de
**5 segundos** — e o colaborador de campo normalmente **não tem e-mail
corporativo**.

## Decisão

- **Colaborador de campo:** loga com **matrícula** (`employee_code`) + **PIN de
  4 dígitos**. Por baixo, o Supabase Auth é acionado com um **e-mail sintético**
  no formato `colaborador-{employee_code}@{tenant_slug}.local` e uma senha
  derivada do PIN. O e-mail sintético garante unicidade e identifica o tenant.
- **Admin e supervisor:** login normal por e-mail + senha.
- **Identidade no device compartilhado:** selfie opcional no check-in
  (configurável por posto) desencoraja que outra pessoa assuma o login.
- **Segurança do PIN:** hash bcrypt; 5 tentativas erradas em 5 min → bloqueio de
  15 min. O colaborador não recupera a própria senha — o **supervisor reseta**
  pelo painel web.

## Consequências

- Login rápido e viável para quem tem pouca familiaridade com tecnologia.
- Funciona bem num aparelho compartilhado que troca de mão a cada plantão.
- O e-mail sintético é um "hack" sobre o Supabase Auth (que exige um e-mail) —
  funciona, mas é uma convenção que precisa ser respeitada em todo o código.
- Um PIN de 4 dígitos é fraco isoladamente. O risco é mitigado pelo conjunto:
  device físico preso ao posto + selfie no check-in + auditoria imutável.

## Alternativas consideradas

- **E-mail + senha para todos.** Rejeitada: o colaborador de campo não tem
  e-mail, e digitar e-mail+senha forte em 5 segundos é inviável.
- **Login por CPF.** Rejeitada: CPF é dado pessoal sensível; usá-lo como
  credencial aumenta a exposição à LGPD sem necessidade.
- **Biometria como login primário.** Rejeitada: o aparelho é compartilhado entre
  vários colaboradores — a biometria do device não distingue um do outro.
