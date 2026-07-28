# BaristaOS v3.3.2

## Sprint: cancelamento de atendimento vazio

### Objetivo
Permitir que uma mesa aberta por engano seja liberada com segurança quando a comanda ainda não possui consumo.

### Implementado
- Botão **Cancelar atendimento** exibido somente em comandas abertas e sem itens.
- Modal de confirmação com motivo obrigatório de 3 a 300 caracteres.
- Endpoint `PATCH /api/v1/tables/:id/order/cancel`.
- Validação no backend para impedir cancelamento quando existem itens ou pagamentos.
- Alteração da comanda para `CANCELLED` sem gerar venda, pagamento ou faturamento.
- Liberação automática da mesa para `FREE` e limpeza de `openedAt`.
- Auditoria com motivo, operador e data/hora do cancelamento.

### Banco de dados
Aplicar a migration:

```bash
cd backend
npm run db:generate
npm run db:migrate:deploy
```

Migration criada: `20260728170000_add_order_cancellation_audit`.

### Roteiro de homologação
1. Abra uma mesa e não adicione produtos.
2. Clique em **Cancelar atendimento**.
3. Tente confirmar sem motivo; a interface deve bloquear.
4. Informe um motivo válido e confirme.
5. Verifique o retorno à tela de mesas e se a mesa aparece livre.
6. Abra outra mesa, adicione um produto e confirme que o botão de cancelamento não aparece.
7. Opcionalmente, tente chamar o endpoint de cancelamento nessa comanda com item; a API deve responder com `ORDER_HAS_ITEMS`.

### Arquivos principais alterados
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260728170000_add_order_cancellation_audit/migration.sql`
- `backend/src/modules/tables/tables.order.schemas.ts`
- `backend/src/modules/tables/tables.order.service.ts`
- `backend/src/modules/tables/tables.routes.ts`
- `frontend/src/components/orders/CancelOrderModal.tsx`
- `frontend/src/pages/TableOrderPage.tsx`
- `frontend/src/services/api/orders.service.ts`
- `frontend/src/styles/global.css`

## Correção de homologação 1

- Corrigido o cancelamento de mesas abertas sem itens quando ainda não existe um registro de comanda.
- A abertura da mesa altera seu status para `OPEN`, mas a comanda só era criada ao incluir o primeiro produto.
- Agora, ao cancelar uma mesa realmente vazia, o backend cria diretamente o registro cancelado para preservar motivo, operador e horários, e libera a mesa na mesma transação.
