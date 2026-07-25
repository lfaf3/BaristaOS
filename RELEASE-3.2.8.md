# BaristaOS v3.2.8 — Liberação de mesa e limpeza técnica

## Funcionalidade

- Adiciona a ação **Liberar mesa** para mesas em `READY_TO_CLOSE`.
- Valida no backend que existe uma comanda `PAID` vinculada à mesa.
- Confirma que o total aprovado nos pagamentos cobre o total da comanda.
- Garante o preenchimento de `closedAt` antes da liberação.
- Altera a mesa para `FREE` e limpa `openedAt` em uma transação.
- Atualiza o mapa de mesas após a liberação, redirecionando o operador para `/mesas`.
- Protege a operação contra concorrência e estados inválidos.

## Correções

- Remove declaração duplicada de `discountValue` em `TableOrderPage.tsx`, que impedia a compilação TypeScript.
- Inclui `READY_TO_CLOSE` na validação de status de mesa do backend.

## Limpeza técnica

- Remove cópias JavaScript geradas ao lado dos fontes TypeScript.
- Remove arquivos soltos na raiz do backend que duplicavam módulos de `src/`.
- Remove cópias de schema e migrations fora de `backend/prisma/`.
- Remove arquivos duplicados de configuração e downloads sem função no projeto.
- Remove dados mockados não importados no frontend.
- Centraliza regras de exclusão em `.gitignore` na raiz.
- Mantém apenas os arquivos fonte, migrations oficiais e documentação útil.

## Endpoint

```http
PATCH /api/v1/tables/:id/release
```

## Critérios de aceite

1. Apenas mesa em `READY_TO_CLOSE` pode ser liberada.
2. A comanda vinculada deve estar `PAID`.
3. O total dos pagamentos aprovados deve quitar a comanda.
4. A mesa passa para `FREE`.
5. `openedAt` da mesa passa para `null`.
6. A mesa aparece livre após atualizar a página.
7. Uma nova comanda pode ser aberta na mesma mesa.
