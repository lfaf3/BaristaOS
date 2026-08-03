# BaristaOS — Sprint v3.4.1 — Integração TEF — Entrega 01

## Objetivo

Criar a fundação desacoplada da integração TEF, validar o fluxo com um adaptador simulado e garantir que a venda somente seja fechada depois da confirmação da transação.

## Arquitetura

- `TefProvider`: contrato independente de fornecedor.
- `provider-registry`: seleciona o adaptador configurado.
- `SimulatedTefProvider`: adaptador de homologação desta entrega.
- `tef.service`: orquestra idempotência, autorização, confirmação e fechamento da venda.
- `TefTransaction`: histórico persistente separado do pagamento contábil.

PayGo e SiTef estão previstos no registro de provedores, mas seus adaptadores reais não fazem parte desta entrega. Configurá-los antes da instalação do respectivo adaptador produz erro controlado.

## Regras implementadas

- Crédito e débito não podem mais ser registrados pelo endpoint legado de pagamentos.
- O pagamento TEF deve quitar exatamente o saldo da conta nesta entrega.
- Uma comanda não pode possuir duas transações TEF ativas simultaneamente.
- Cada tentativa utiliza uma chave de idempotência.
- Estados incertos bloqueiam nova cobrança automática.
- O registro `Payment`, a comanda e a mesa somente são atualizados após confirmação do provedor.
- Pagamento, fechamento da comanda e mudança da mesa para `READY_TO_CLOSE` ocorrem na mesma transação de banco.
- Dinheiro, PIX e cortesia preservam o fluxo já homologado.

## Configuração do simulador

Adicionar ao `.env` do backend:

```env
TEF_SIMULATOR_OUTCOME=CONFIRMED
```

Resultados disponíveis para homologação:

- `CONFIRMED`: autoriza, confirma, registra o pagamento e fecha a venda;
- `DECLINED`: simula recusa sem fechar a venda;
- `FAILED`: simula falha controlada sem fechar a venda;
- `UNKNOWN`: simula resultado incerto e impede repetição com nova cobrança.

Reinicie o backend após alterar o resultado configurado.

Cada loja recebe `tef_enabled=true` e `tef_provider=SIMULATED` como configuração inicial. Os futuros adaptadores poderão ser selecionados por loja sem alterar o fluxo de pagamento.

## Banco de dados

Nova migration:

`backend/prisma/migrations/20260803150000_add_tef_transactions/migration.sql`

Antes do build local, aplique a migration e regenere o Prisma Client conforme o procedimento usado no ambiente:

```bash
npm run db:migrate:deploy
npm run db:generate
```

Em um banco exclusivamente local de desenvolvimento, `npm run db:migrate` também pode ser usado conforme o fluxo habitual do projeto.

## Validação local sugerida

1. Configurar o simulador como `CONFIRMED`.
2. Fechar uma comanda e selecionar Crédito ou Débito.
3. Confirmar que o pagamento é processado e a mesa passa para “Pagamento concluído”.
4. Liberar a mesa normalmente.
5. Repetir com `DECLINED` e confirmar que a comanda permanece aguardando pagamento.
6. Repetir com `FAILED` e confirmar que a venda não é fechada.
7. Repetir com `UNKNOWN` e confirmar que a interface orienta a não repetir a cobrança.
8. Validar que dinheiro, PIX e cortesia continuam funcionando.
9. Validar crédito parcelado e débito sem parcelamento.
10. Executar os builds localmente no VS Code.

## Arquivos do PATCH

- `backend/.env.example`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260803150000_add_tef_transactions/migration.sql`
- `backend/src/app.ts`
- `backend/src/config/env.ts`
- `backend/src/modules/payments/payments.schemas.ts`
- `backend/src/modules/tef/providers/tef-provider.ts`
- `backend/src/modules/tef/providers/simulated-tef-provider.ts`
- `backend/src/modules/tef/providers/provider-registry.ts`
- `backend/src/modules/tef/tef.schemas.ts`
- `backend/src/modules/tef/tef.routes.ts`
- `backend/src/modules/tef/tef.service.ts`
- `frontend/src/components/TablePaymentModal.tsx`
- `frontend/src/pages/TableOrderPage.tsx`
- `frontend/src/services/api/api-error.ts`
- `frontend/src/services/api/orders.service.ts`
- `frontend/src/styles/global.css`
- `README-ENTREGA-01-v3.4.1.md`

## Status

Código preparado para migration, build e homologação local. Nenhum build foi executado durante a preparação do PATCH. O versionamento `v3.4.1` deve ocorrer somente após a conclusão e homologação da sprint.
