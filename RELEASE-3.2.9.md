# BaristaOS v3.2.9 — Histórico de comandas

## Objetivo

Disponibilizar uma consulta operacional das comandas pagas e encerradas, sem alterar o fluxo homologado de mesas e pagamentos.

## Funcionalidades

- Nova opção **Pedidos** no menu lateral.
- Listagem de comandas pagas por período.
- Filtro por data inicial, data final e número da mesa.
- Paginação com 20 comandas por página.
- Exibição de mesa, encerramento, quantidade de itens, pagamentos, operador e total.
- Detalhamento da comanda com produtos, observações, subtotal, desconto, taxa de serviço e pagamentos.
- Histórico isolado por loja (`storeId`).
- Apenas comandas com status `PAID` são exibidas.

## Endpoints

- `GET /api/v1/orders/history`
- `GET /api/v1/orders/history/:id`

Parâmetros opcionais da listagem:

- `dateFrom=YYYY-MM-DD`
- `dateTo=YYYY-MM-DD`
- `tableNumber=1`
- `page=1`
- `pageSize=20`

## Arquivos alterados

- `backend/src/app.ts`
- `frontend/src/app/App.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/styles/global.css`

## Arquivos criados

- `backend/src/modules/orders/orders.history.routes.ts`
- `backend/src/modules/orders/orders.history.schemas.ts`
- `backend/src/modules/orders/orders.history.service.ts`
- `frontend/src/pages/OrderHistoryPage.tsx`
- `frontend/src/services/api/order-history.service.ts`
- `RELEASE-3.2.9.md`

## Banco de dados

Nenhuma migration foi necessária. A funcionalidade usa os dados já armazenados em `orders`, `order_items`, `payments`, `cafe_tables` e `users`.
