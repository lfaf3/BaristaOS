# BaristaOS v3.2.7 — Correção do pagamento misto

## Correções

- Corrigido o botão **Adicionar outra forma** quando a primeira forma já contém o total da conta.
- Ao adicionar uma nova forma com saldo zerado, o sistema divide a maior parcela existente, preservando o total em centavos.
- Mantido o limite de até 10 formas de pagamento.
- Registrada a rota de pagamentos no código-fonte oficial `backend/src/app.ts`.
- Restaurados os arquivos TypeScript oficiais do módulo `backend/src/modules/payments`.
- Adicionado `COURTESY` ao enum `PaymentMethod` do `backend/prisma/schema.prisma`.

## Validação principal

1. Abrir uma conta em `PAYMENT`.
2. Abrir o modal de recebimento.
3. Clicar em **Adicionar outra forma** mesmo com saldo inicialmente zerado.
4. Ajustar, por exemplo, PIX e Crédito até o saldo ficar em R$ 0,00.
5. Confirmar e verificar os dois registros e o estado `READY_TO_CLOSE`.
