# BaristaOS — Release 3.2.5

## Gerenciamento dos itens da comanda

Esta release permite gerenciar os itens já lançados em uma comanda aberta.

## Entregas

### Backend

- `PATCH /api/v1/tables/:id/order/items/:itemId`
  - altera a quantidade entre 1 e 99;
  - adiciona, altera ou remove a observação do item;
  - valida que o item pertence à comanda aberta da mesa e da loja autenticada;
  - recalcula subtotal e total dentro da mesma transação.
- `DELETE /api/v1/tables/:id/order/items/:itemId`
  - remove o item da comanda;
  - recalcula subtotal e total;
  - retorna a comanda completa e atualizada.

### Frontend

- botões para aumentar e diminuir a quantidade;
- ao diminuir um item com quantidade 1, ele é removido;
- botão para remoção direta;
- edição inline de observações com limite de 300 caracteres;
- estados de carregamento e erro por item;
- atualização imediata dos totais sem recarregar a página;
- persistência das alterações após atualizar o navegador.

## Arquivos principais alterados

- `backend/src/modules/tables/tables.order.schemas.ts`
- `backend/src/modules/tables/tables.order.service.ts`
- `backend/src/modules/tables/tables.routes.ts`
- `frontend/src/services/api/orders.service.ts`
- `frontend/src/pages/TableOrderPage.tsx`
- `frontend/src/styles/global.css`

## Critérios de aceite

1. Adicionar um produto a uma mesa aberta.
2. Aumentar a quantidade e confirmar a atualização do subtotal e total.
3. Diminuir a quantidade e confirmar o recálculo.
4. Diminuir um item de quantidade 1 e confirmar sua remoção.
5. Remover um item diretamente.
6. Adicionar, alterar e apagar uma observação.
7. Atualizar a página e confirmar a persistência.
8. Voltar ao mapa de mesas e confirmar quantidade de itens e valor atualizados.

## Banco de dados

Esta release não cria migration. O campo `notes` já existia em `order_items`.
