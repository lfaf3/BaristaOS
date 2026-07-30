# RELEASE 3.3.7

Data: 30/07/2026

## Gestão de Estoque — Fase 1

- Cadastro de insumos com categoria, unidade, saldo, estoque mínimo, custo e fornecedor.
- Unidades: kg, g, L, mL e unidade.
- Entradas, saídas e ajustes de inventário.
- Bloqueio de saída superior ao saldo disponível.
- Histórico auditável com usuário, data, saldo anterior e saldo resultante.
- Alertas visuais para estoque baixo.
- Busca e filtro de itens críticos.
- Indicadores de itens, categorias, alertas e valor estimado do estoque.
- Novo item Estoque no menu principal.

## Banco de dados

Nova migration `20260730200000_add_inventory_phase1`.
