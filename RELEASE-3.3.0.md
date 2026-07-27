# BaristaOS v3.3.0 — Dashboard e preparação para piloto

## Objetivo

Preparar o BaristaOS para a fase de operação assistida na cafeteria, adicionando visão gerencial do dia e impressão básica de comandas encerradas.

## Funcionalidades adicionadas

### Dashboard gerencial

Nova opção **Dashboard** no menu lateral, com:

- faturamento do dia;
- quantidade de pedidos pagos;
- ticket médio;
- comparação de faturamento e pedidos com o dia anterior;
- produto mais vendido;
- forma de pagamento com maior volume;
- mesa mais utilizada;
- resumo de mesas livres, em atendimento e bloqueadas.

Novo endpoint:

```http
GET /api/v1/dashboard/summary
```

Os indicadores consideram somente comandas `PAID` da loja autenticada e respeitam o dia comercial no fuso `America/Sao_Paulo`.

### Impressão

O detalhamento de uma comanda encerrada agora possui o botão **Imprimir**.

A folha de impressão foi otimizada para bobina de 80 mm e contém:

- identificação da mesa ou venda de balcão;
- horários;
- operador;
- itens;
- pagamentos;
- subtotal, desconto, serviço e total.

A impressão utiliza o diálogo nativo do navegador e não exige driver ou integração adicional nesta etapa.

## Banco de dados

Nenhuma migration necessária.

## Validação sugerida

1. Acessar **Dashboard** pelo menu lateral.
2. Confirmar faturamento, pedidos e ticket médio do dia.
3. Comparar os valores com o Histórico de Comandas.
4. Confirmar produto, pagamento e mesa em destaque.
5. Abrir uma comanda em **Pedidos**.
6. Clicar em **Imprimir**.
7. Conferir a pré-visualização em formato de comprovante.
8. Testar atualização pelo botão **Atualizar**.
9. Testar o dashboard em um dia sem vendas.

## Arquivos da versão

Consulte o pacote PATCH para aplicar somente os arquivos alterados.
