# BaristaOS v3.2.7 — Pagamentos

## Objetivo

Registrar o recebimento de uma conta fechada, incluindo pagamentos simples e mistos, e mover a mesa para o estado `READY_TO_CLOSE`.

## Backend

- Novo estado de mesa `READY_TO_CLOSE`.
- Nova forma de pagamento `COURTESY`, preparada para cortesias.
- Novo endpoint `POST /api/v1/orders/:id/payments`.
- Registro de uma ou mais formas de pagamento na mesma operação.
- Formas suportadas: dinheiro, PIX, crédito, débito e cortesia.
- Validação para impedir valor acima ou abaixo do saldo.
- Pagamento e transição de estados executados em transação.
- Comanda passa de `OPEN` para `PAID`.
- Mesa passa de `PAYMENT` para `READY_TO_CLOSE`.
- Pagamentos aprovados, valor pago e saldo retornados na consulta da comanda.

## Frontend

- Modal de recebimento na tela da comanda.
- Pagamento único com preenchimento automático do total.
- Inclusão e remoção de formas para pagamento misto.
- Exibição do valor informado e saldo em tempo real.
- Histórico das formas de pagamento após a confirmação.
- Estado visual “Pagamento concluído”.
- Mapa de mesas atualizado para exibir mesas pagas aguardando liberação.

## Migração

`20260724150000_add_ready_to_close_and_courtesy`

## Critérios de aceite

1. Registrar pagamento em dinheiro.
2. Registrar pagamento via PIX.
3. Registrar pagamento em crédito e débito.
4. Registrar pagamento misto com duas ou mais formas.
5. Impedir pagamento acima do saldo.
6. Impedir confirmação abaixo do saldo.
7. Alterar a mesa para `READY_TO_CLOSE` após quitação integral.
8. Manter pagamentos e status após atualizar a página.
9. Exibir a mesa paga no mapa de mesas.

## Correção de validação — pagamento misto

- Corrigido o botão **Adicionar outra forma**, que ficava desabilitado quando a primeira forma já preenchia o total da conta.
- Ao adicionar uma segunda forma com o total já integralmente preenchido, o valor da última forma é dividido automaticamente entre as duas linhas.
- O operador continua podendo ajustar livremente os valores, mantendo a validação de saldo igual a zero antes da confirmação.
