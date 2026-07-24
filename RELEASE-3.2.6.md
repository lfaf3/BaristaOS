# BaristaOS v3.2.6 — Fechamento da conta

## Objetivo

Preparar uma comanda aberta para pagamento, calculando serviço, desconto e total final, e alterando a mesa de `OPEN` para `PAYMENT`.

## Backend

- Novo endpoint `PATCH /api/v1/tables/:id/order/close`.
- Validação de mesa em atendimento, comanda aberta e existência de itens.
- Cálculo transacional do subtotal a partir dos itens.
- Taxa de serviço configurável entre 0% e 100%.
- Desconto fixo em reais, limitado ao valor total da conta.
- Persistência da taxa, valor do serviço, desconto e total.
- Mudança atômica do status da mesa para `PAYMENT`.
- Bloqueio de inclusão, alteração e remoção de itens depois do fechamento.

## Banco de dados

Migration:

`20260723190000_add_order_closing_values`

Novos campos em `orders`:

- `service_charge_rate DECIMAL(5,2)`
- `service_charge DECIMAL(12,2)`

## Frontend

- Campos para percentual de serviço e desconto.
- Prévia instantânea do total final.
- Confirmação antes de fechar a conta.
- Estado visual "Aguardando pagamento".
- Bloqueio dos controles da comanda depois do fechamento.
- Persistência dos valores após atualizar a página.

## Aplicação

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate:deploy
npm run build

cd ../frontend
npm install
npm run build
```

## Critérios de aceite

1. Fechar uma comanda com itens e taxa de serviço.
2. Aplicar desconto válido e confirmar o total.
3. Impedir desconto maior que a conta.
4. Impedir fechamento de comanda vazia.
5. Confirmar mudança da mesa para `PAYMENT`.
6. Confirmar bloqueio de edição depois do fechamento.
7. Atualizar a página e confirmar persistência.
8. Voltar ao mapa e confirmar status e valor da mesa.
