# Sprint 2 — Catálogo, Mesas e Caixa

## Entregue

- Categorias: listar e criar.
- Produtos: listar, pesquisar, filtrar, criar, consultar e editar.
- Pesquisa por código, nome, categoria e aliases (`cap`, `pq`).
- Mesas: listar com informações do pedido aberto, consultar e alterar status.
- Caixa: abrir, consultar sessão atual e fechar.
- Isolamento por empresa e loja obtidos do JWT.
- Campo `guestCount` adicionado aos pedidos.

## Migration

Após substituir/mesclar os arquivos:

```bash
npm run db:generate
npm run db:migrate -- --name sprint_2_catalog_tables_cash
npm run db:seed
npm run dev
```
