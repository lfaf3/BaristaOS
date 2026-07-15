# BaristaOS React v1.0

Primeira base oficial do frontend do BaristaOS.

## Tecnologias

- React
- TypeScript
- Vite
- React Router
- Lucide Icons
- CSS com tokens do Barista Design System

## Fluxos implementados

- Login
- Abertura de caixa
- Mapa de mesas
- Venda de balcão
- Modo Rush
- Categorias
- Pesquisa por nome, código, categoria e apelido
- Carrinho
- Alteração de quantidades
- Pagamento em dinheiro, PIX e TEF simulado
- Comprovante
- Liberação da mesa após a venda

## Como executar no Windows

1. Instale o Node.js LTS.
2. Extraia o ZIP.
3. Abra a pasta no Visual Studio Code.
4. Abra o terminal integrado.
5. Execute:

```bash
npm install
npm run dev
```

6. O navegador abrirá em:

```text
http://localhost:5173
```

## Gerar uma versão de produção

```bash
npm run build
```

Os arquivos serão criados na pasta `dist`.

## Estrutura principal

```text
src/
├── app/
│   ├── App.tsx
│   └── AppContext.tsx
├── components/
├── data/
├── pages/
├── styles/
├── types/
└── utils/
```

## Atalhos do Modo Rush

- F2: pesquisar
- F4: voltar para mesas
- F9: finalizar venda
- ESC: fechar pagamento ou voltar
- Enter na pesquisa: adiciona o primeiro resultado

## Limitações atuais

Esta versão é somente frontend demonstrativo. Ainda não possui:

- Backend
- Banco de dados
- Login real
- Persistência
- TEF real
- NFC-e
- Impressão térmica integrada
- Operação offline real
