# RELEASE 3.3.6

Data: 29/07/2026

## Dashboard inteligente

- Novo painel operacional com atualização automática a cada 60 segundos.
- Cards de vendas, pedidos, ticket médio e ocupação de mesas.
- Gráfico responsivo de vendas dos últimos sete dias.
- Meta diária com progresso visual.
- Ranking dos dez produtos mais vendidos, incluindo faturamento.
- Indicadores de pedidos em andamento, finalizados e tempo médio de atendimento.
- Visão em gráfico de anel da situação das mesas.
- Alertas para mesas abertas há muito tempo e pedidos sem movimentação.
- Feed das últimas movimentações de itens e pagamentos.
- Skeletons de carregamento e preservação dos últimos dados em falhas temporárias.
- Componentes adaptados aos temas Espresso, Espresso Dark e cores personalizadas.

## API

- Expandido `GET /api/v1/dashboard/summary` com tendência, operação, meta, ranking, alertas e atividades.

## Banco de dados

- Nenhuma migration necessária.
