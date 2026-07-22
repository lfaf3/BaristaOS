# BaristaOS v3.2.4 — Inclusão de produtos na comanda

## Objetivo
Permitir que o operador pesquise produtos reais e os inclua em uma comanda de mesa aberta.

## Backend
- Novo endpoint `POST /api/v1/tables/:id/order/items`.
- Validação de mesa ativa e com status `OPEN`.
- Validação de produto ativo e pertencente à empresa autenticada.
- Validação de caixa aberto na loja.
- Criação automática do pedido no primeiro item da mesa.
- Registro do preço do produto no momento da venda.
- Recalculo transacional de subtotal e total.
- Retorno da comanda completa após a inclusão.

## Frontend
- Botão “Adicionar produto” ativado.
- Modal com pesquisa por nome, código, categoria e apelidos.
- Seleção de produto e quantidade entre 1 e 99.
- Inclusão com atualização imediata da lista e dos totais.
- Estados de busca, vazio, erro e envio.

## Arquivos principais
- `backend/src/modules/tables/tables.order.schemas.ts`
- `backend/src/modules/tables/tables.order.service.ts`
- `backend/src/modules/tables/tables.routes.ts`
- `frontend/src/components/AddProductModal.tsx`
- `frontend/src/pages/TableOrderPage.tsx`
- `frontend/src/services/api/orders.service.ts`
- `frontend/src/services/api/products.service.ts`
- `frontend/src/styles/global.css`

## Teste de aceite
1. Abra o caixa.
2. Abra uma mesa livre.
3. Entre na comanda da mesa.
4. Clique em “Adicionar produto”.
5. Pesquise e selecione um produto.
6. Escolha a quantidade e confirme.
7. Confirme que o item aparece, os totais são atualizados e os dados persistem após F5.
8. Volte ao mapa e confirme a quantidade de itens e o total da mesa.
