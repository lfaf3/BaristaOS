# Correção — Log de operações TEF

## Problema

A tela **Configurações → Pagamentos** consultava somente o histórico local do `MockPaymentProvider`. As operações de cartão realizadas em comandas seguem o módulo TEF real do backend e são persistidas em `tef_transactions`, portanto nunca apareciam nessa tela.

## Correção

- Adicionada consulta autenticada `GET /api/v1/orders/tef/transactions`.
- O backend retorna as 500 transações TEF mais recentes da loja autenticada.
- O log apresenta data, hora, identificador da sessão, operadora, valor, status e duração.
- A tela combina as operações persistidas no backend com eventuais sessões Mock armazenadas localmente.
- Foram adicionados estados visuais de carregamento e erro da consulta.

## Aplicação

Extraia o PATCH na raiz do projeto atualizado, substituindo os arquivos coincidentes.

## Validação sugerida

1. Efetuar um pagamento de comanda por crédito ou débito TEF.
2. Acessar **Configurações → Pagamentos**.
3. Confirmar a presença da operação com status `CONFIRMED`, valor e duração.

Nenhum build foi executado na preparação deste PATCH.
