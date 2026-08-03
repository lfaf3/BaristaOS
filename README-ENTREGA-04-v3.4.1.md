# BaristaOS — Sprint v3.4.1 — Entrega 04

## Resumo

Esta entrega transforma o pagamento em uma máquina de estados, mantendo o provedor mock e preparando o fluxo para os futuros adapters de TEF. A venda permanece bloqueada durante todo o ciclo e somente é liberada depois de `FINISHED`.

```text
CREATED
  → WAITING_DEVICE
  → PROCESSING
  → AUTHORIZED
  → CONFIRMED
  → FINISHED
```

Também estão previstos os estados terminais `CANCELLED`, `FAILED` e `TIMEOUT`.

## Backend

- `PaymentStatus` contém todos os estados da transação.
- `PaymentTransaction` mantém em memória identificadores, provedor, valor, datas, autorização, estado atual e histórico de eventos.
- `PaymentService` expõe `updateStatus()`, `getTransaction()` e `finishTransaction()`.
- `MockPaymentProvider` emite cada estado da sequência com intervalos aleatórios de 300 a 800 ms.
- Cada mudança registra `timestamp`, `status` e mensagem para depuração e futura auditoria.

## Frontend

- `PaymentProgress` é o componente reutilizável responsável pela apresentação dos estados.
- O Caixa recebe as transições do serviço e apenas atualiza o componente.
- O modal alterna dinamicamente entre **Aguardando PinPad**, **Processando**, **Pagamento autorizado**, **Confirmando venda** e **Venda concluída**.
- O fluxo continua bloqueante até a finalização e preserva as ações de tentativa e cancelamento nos cenários de erro.
- O histórico mock permanece disponível em memória por `paymentService.getTransaction(transactionId)` e cada evento também é registrado no console.

## Arquivos modificados

- `backend/src/modules/payment-integration/dtos/payment-status.ts`
- `backend/src/modules/payment-integration/index.ts`
- `backend/src/modules/payment-integration/payment.service.ts`
- `backend/src/modules/payment-integration/providers/mock-payment-provider.ts`
- `backend/src/modules/payment-integration/providers/payment-provider.ts`
- `frontend/src/components/PaymentModal.tsx`
- `frontend/src/pages/RushPage.tsx`
- `frontend/src/services/payment.service.ts`

## Arquivos adicionados

- `backend/src/modules/payment-integration/payment-transaction.ts`
- `frontend/src/components/PaymentProgress.tsx`
- `README-ENTREGA-04-v3.4.1.md`

## Aplicação do PATCH

1. Use como base o BaristaOS com a Entrega 03 homologada.
2. Extraia o ZIP na raiz do projeto, preservando a estrutura de diretórios.
3. Confirme a substituição dos oito arquivos modificados e a inclusão dos dois novos arquivos de código.
4. Mantenha todos os demais arquivos da Entrega 03; este pacote é incremental.

## Roteiro de homologação

1. No Caixa, adicione um produto e clique em **Finalizar venda**.
2. Confira a evolução automática por `CREATED`, `WAITING_DEVICE` e `PROCESSING`.
3. Confirme a tela **Pagamento autorizado**, com provedor e código de autorização.
4. Clique em **OK** e confira **Confirmando venda...** e depois **Venda concluída**.
5. Confirme que o Caixa é liberado somente depois de `FINISHED`.
6. Consulte o console para conferir os eventos com timestamp, transação, status e mensagem.

## Observações

- As transações e seus logs ainda são mantidos somente em memória.
- Nenhuma dependência foi adicionada.
- Nenhuma integração física PayGo ou SiTef foi ativada.
- O build não foi executado na preparação deste PATCH, conforme solicitado.
