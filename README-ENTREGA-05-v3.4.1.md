# BaristaOS v3.4.1 — Entrega 05

PATCH incremental sobre a Entrega 04 homologada.

## Objetivo

Introduzir a sessão de pagamento entre a venda e o serviço/provedor, preservando o fluxo homologado e preparando a integração assíncrona com TEFs físicos.

## Backend

- `PaymentSession` e `PaymentEvent` em memória.
- `PaymentService` com `createSession()`, `appendEvent()`, `closeSession()` e `cancelSession()`.
- Novo estado `CARD_INSERTED`.
- `PaymentProvider` preparado para `onStatusChanged()`, `onMessage()` e `onError()`.
- Mock simulando `CREATED → WAITING_DEVICE → CARD_INSERTED → PROCESSING → AUTHORIZED → CONFIRMED → FINISHED`, com intervalos de 300–800 ms.

## Frontend

- Serviço mock com ciclo de vida e histórico de `PaymentSession`.
- `PaymentProgress` com linha do tempo.
- Modal exibindo Sessão, Operadora e Valor.
- Confirmação, finalização, cancelamento e falhas homologados preservados.

## Aplicação

Copie o conteúdo deste PATCH sobre a raiz da base com a Entrega 04 homologada, preservando a estrutura de pastas.

## Arquivos incluídos

- `backend/src/modules/payment-integration/dtos/payment-status.ts`
- `backend/src/modules/payment-integration/index.ts`
- `backend/src/modules/payment-integration/payment-event.ts`
- `backend/src/modules/payment-integration/payment-session.ts`
- `backend/src/modules/payment-integration/payment.service.ts`
- `backend/src/modules/payment-integration/providers/mock-payment-provider.ts`
- `backend/src/modules/payment-integration/providers/payment-provider.ts`
- `frontend/src/components/PaymentModal.tsx`
- `frontend/src/components/PaymentProgress.tsx`
- `frontend/src/pages/RushPage.tsx`
- `frontend/src/services/payment.service.ts`
- `frontend/src/styles/global.css`

## Validação

Conforme solicitado, nenhum build foi executado nesta entrega.
