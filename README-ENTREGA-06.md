# BaristaOS — Sprint v3.4.0 — Entrega 06

## Objetivo

Finalizar a experiência de fichas técnicas e preparar o frontend para a baixa automática de insumos prevista para a Sprint v3.4.1.

## Alterações realizadas

- Modal de visualização completa carregando a versão mais recente da ficha pela API (`GET /recipes/:id`).
- Resumo da receita com rendimento, quantidade de ingredientes, custo teórico total e custo por unidade de rendimento.
- Exibição da quantidade base e do consumo efetivo de cada ingrediente, já considerando a perda cadastrada.
- Indicação de compatibilidade entre consumo teórico e estoque atual.
- Estrutura de preparação para a v3.4.1 por meio dos atributos `data-auto-deduction-ready`, `data-inventory-item-id` e `data-effective-quantity`.
- Atualização dos indicadores após criação, edição, desativação e atualização manual.
- Correção das mensagens distintas para criação e edição.
- Estados de carregamento, vazio de observações, confirmação de desativação e melhorias responsivas.
- Acesso direto à edição a partir do modal de visualização.

## Arquivos do PATCH

- `frontend/src/pages/RecipesPage.tsx`
- `frontend/src/styles/global.css`
- `README-ENTREGA-06.md`

## Aplicação

Copie os arquivos do PATCH sobre o frontend homologado da Entrega 05, preservando a estrutura de diretórios.

## Validação local

```bash
npm run build
```

## Roteiro de homologação

1. Abrir Fichas técnicas e confirmar o estado de carregamento.
2. Pesquisar e filtrar fichas ativas/inativas.
3. Abrir uma ficha e validar os dados completos, custo total, custo por rendimento e estoque.
4. Editar a ficha pelo modal, salvar e confirmar a atualização da tabela e dos indicadores.
5. Criar uma ficha e confirmar a mensagem de criação e a atualização dos indicadores.
6. Desativar uma ficha, confirmar a pergunta de segurança e validar os indicadores.
7. Validar o modal em resolução desktop e mobile.
8. Executar `npm run build`.

## Status

Código preparado para build e homologação local. A versão `v3.4.0` deve ser criada somente após homologação.
