# BaristaOS v3.3.5 — Configurações da Loja

## Objetivo

Transformar os dados fixos da instalação em configurações administráveis pela interface, criando a base para personalização, impressão e integrações fiscais futuras.

## Entregas

- Tela **Configurações** no menu principal.
- Abas Empresa, Endereço, Contato, Identidade, Impressão e Sistema.
- Cadastro de razão social, nome fantasia, CNPJ, inscrição estadual, regime tributário e CNAE.
- Cadastro completo de endereço e contatos.
- Upload de logomarca PNG, JPG ou WEBP com limite de 1,5 MB.
- Nome exibido e cor principal configuráveis.
- Mensagem de rodapé e opções de exibição no comprovante.
- Configuração de idioma, moeda e fuso horário.
- Integração das configurações com a barra lateral e o comprovante impresso.
- API autenticada para leitura e atualização da empresa.

## Banco de dados

Esta versão contém migration. Execute no backend:

```bash
npm run db:generate
npm run db:migrate:deploy
```

## Roteiro de homologação

1. Acesse **Configurações** no menu.
2. Altere Razão Social, Nome Fantasia e CNPJ e salve.
3. Preencha endereço e contatos e salve novamente.
4. Envie uma logomarca válida e confirme a prévia.
5. Altere o nome exibido e a cor principal.
6. Configure a mensagem de rodapé e desligue uma das opções de impressão.
7. Abra novamente a tela e confirme a persistência dos dados.
8. Abra o histórico, visualize um comprovante e confira nome, logomarca, CNPJ, endereço, telefone e rodapé conforme as opções selecionadas.
9. Reinicie frontend e backend e confirme que as configurações continuam aplicadas.
