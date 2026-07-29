# BaristaOS v3.3.4

## Sprint — Polimento da operação

Esta versão melhora a experiência diária do operador, padronizando feedbacks, prevenindo ações repetidas e facilitando a localização de atendimentos.

## Implementado

- Toasts globais para sucesso, erro, atenção e informação.
- Mensagens de confirmação nas principais operações da comanda.
- Mensagens amigáveis para códigos de erro conhecidos do backend.
- Pesquisa instantânea por número da mesa ou identificação personalizada.
- Pesquisa sem diferenciação entre letras maiúsculas e minúsculas.
- Botão para limpar a pesquisa, contador de resultados e estado vazio.
- Indicadores de carregamento e bloqueio de ações enquanto a requisição está em andamento.
- Versão exibida no menu lateral atualizada para v3.3.4.

## Arquivos principais

- `frontend/src/components/feedback/ToastProvider.tsx`
- `frontend/src/pages/TablesPage.tsx`
- `frontend/src/pages/TableOrderPage.tsx`
- `frontend/src/services/api/api-error.ts`
- `frontend/src/app/App.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/styles/global.css`

## Banco de dados

Nenhuma migration é necessária nesta versão.

## Roteiro de homologação

1. Acesse o mapa de mesas e pesquise pelo número de uma mesa.
2. Abra um atendimento com identificação personalizada e pesquise por parte do nome.
3. Pesquise um termo inexistente e confira o estado de resultado vazio.
4. Abra uma mesa e confirme o toast de sucesso.
5. Adicione, altere e remova um produto, verificando as mensagens de confirmação.
6. Durante cada operação, tente clicar novamente no botão e confirme que ele permanece bloqueado.
7. Feche uma conta, registre o pagamento e libere a mesa, conferindo os feedbacks.
8. Provoque uma identificação duplicada e confirme a mensagem específica de erro.

## Observação de build

A instalação das dependências não pôde ser concluída no ambiente de geração porque o repositório interno retornou `404` para o pacote `yallist@3.1.1`. A integridade estrutural dos pacotes foi verificada, mas o build final deve ser executado no ambiente local.
