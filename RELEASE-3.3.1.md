# BaristaOS v3.3.1 — Print Engine

## Objetivo

Corrigir a pré-visualização em branco da impressão e criar uma estrutura reutilizável para cupons térmicos.

## Entregas

- Modal dedicado de pré-visualização da comanda.
- Componente reutilizável de cupom (`ReceiptPrint`).
- Renderização do modal por portal, fora da árvore principal da aplicação.
- CSS exclusivo para impressão em bobina de 80 mm.
- Impressão apenas do conteúdo do cupom.
- Cabeçalho DM CAFFÈ, dados do atendimento, itens, observações, totais e pagamentos.
- Fechamento por botão, clique no fundo ou tecla `Esc`.
- Possibilidade de salvar em PDF pelo diálogo nativo do navegador.

## Correção técnica

Na v3.3.0, as regras de impressão ocultavam `.dashboard-main`. Como o modal de detalhes estava dentro desse elemento, o conteúdo também era ocultado, gerando uma pré-visualização em branco.

Na v3.3.1, o conteúdo de impressão é montado diretamente no `document.body` por meio de `createPortal`. Durante a impressão, todos os demais elementos são ocultados e somente o portal do cupom permanece visível.

## Banco de dados

Nenhuma migration necessária.

## Roteiro de homologação

1. Acessar **Pedidos**.
2. Abrir uma comanda encerrada.
3. Clicar em **Pré-visualizar impressão**.
4. Conferir a bobina exibida no modal.
5. Clicar em **Imprimir**.
6. Confirmar que a pré-visualização do navegador contém apenas a comanda.
7. Testar impressão ou opção **Salvar como PDF**.
8. Fechar o modal pelo botão, pelo fundo e pela tecla `Esc`.


## Correção complementar de homologação

Durante o teste de geração de PDF foi identificado que o navegador ainda imprimia o contêiner rolável do modal, causando barra de rolagem visível e corte da comanda.

A implementação foi ajustada para manter duas renderizações separadas:

- uma cópia dentro do modal, usada somente para pré-visualização;
- uma cópia independente (`.print-document`), usada exclusivamente pelo `window.print()`.

O documento impresso não possui altura máxima, `overflow` ou dependência da estrutura visual do modal, permitindo que a bobina cresça conforme a quantidade de itens.
