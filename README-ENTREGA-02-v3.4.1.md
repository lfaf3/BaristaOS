# BaristaOS — Sprint v3.4.1 — Entrega 02

## Resumo

Esta entrega adiciona a camada de abstração de pagamentos/TEF sem comunicação física. O backend passa a oferecer um contrato único para provedores, seleção centralizada do provedor configurado e respostas padronizadas. O provedor `MockPaymentProvider` simula autorização após aproximadamente 2 segundos e mantém os estados da transação em memória.

No frontend, o caixa utiliza um `PaymentService` mock com início, cancelamento e confirmação do pagamento. Depois de **Finalizar venda**, o modal percorre os estados **Pagamento**, **Processando pagamento...**, **Pagamento autorizado** e **Venda concluída**.

Não há integração real com PayGo ou SiTef nesta entrega. Esses adaptadores poderão implementar `PaymentProvider` e ser registrados no ponto de composição sem alterações no restante do fluxo.

## Arquivos adicionados

- `backend/src/modules/payment-integration/dtos/payment-request.ts`
- `backend/src/modules/payment-integration/dtos/payment-response.ts`
- `backend/src/modules/payment-integration/dtos/payment-status.ts`
- `backend/src/modules/payment-integration/providers/payment-provider.ts`
- `backend/src/modules/payment-integration/providers/mock-payment-provider.ts`
- `backend/src/modules/payment-integration/payment.service.ts`
- `backend/src/modules/payment-integration/index.ts`
- `frontend/src/services/payment.service.ts`
- `README-ENTREGA-02-v3.4.1.md`

## Arquivo modificado

- `frontend/src/components/PaymentModal.tsx`

## Aplicação do PATCH

1. Faça uma cópia de segurança do projeto homologado da Entrega 01.
2. Extraia o ZIP na raiz do projeto BaristaOS, preservando a estrutura de pastas.
3. Confirme a substituição de `frontend/src/components/PaymentModal.tsx`.
4. Não remova arquivos da Entrega 01; este pacote é incremental e deve ser aplicado sobre ela.
5. Execute o procedimento local habitual de build e validação do backend e frontend.

## Roteiro de homologação

1. Abra o caixa e adicione ao menos um produto à venda.
2. Selecione uma forma de pagamento.
3. Clique em **Finalizar venda** e confirme que o modal inicia em **Pagamento**.
4. Clique em **Iniciar pagamento** e confirme a exibição de **Processando pagamento...** por aproximadamente 2 segundos.
5. Confirme a transição para **Pagamento autorizado**, com um código de autorização mock.
6. Clique em **Concluir venda** e confirme a exibição de **Venda concluída** e do comprovante.
7. Finalize em **Voltar às mesas** e confirme que o fluxo anterior de conclusão da venda permanece funcionando.
8. Repita o fluxo e, durante o processamento, clique em **Cancelar operação**; confirme que o modal fecha e a venda não é concluída.
9. Repita os testes com Dinheiro, PIX e TEF para validar que o fluxo mock é independente do futuro provedor físico.

## Observações técnicas

- O mock do backend armazena transações somente em memória; reiniciar o processo limpa os estados.
- O provedor padrão desta entrega é `MOCK`, composto em `backend/src/modules/payment-integration/index.ts`.
- Nenhuma rota de comunicação física e nenhum SDK de TEF foram adicionados.
- Nenhuma dependência foi adicionada.
- O build não foi executado na preparação deste PATCH, conforme solicitado.
