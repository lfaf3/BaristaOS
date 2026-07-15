# BaristaOS — Sprint 3 / Release 3.1

Pacote de atualização do frontend atual. Preserva o branding e a interface.

## Instalação

1. Crie a branch:
```bash
git checkout -b feat/sprint-3-release-3-1
```
2. Copie os arquivos deste pacote para o frontend, respeitando as pastas. `App.tsx`, `Topbar.tsx` e `LoginPage.tsx` substituem os atuais.
3. Instale Axios:
```bash
npm install axios
```
4. Copie `.env.example` para `.env`.
5. Copie `src/styles.release-3.1.css` para o final de `src/styles/global.css`.
6. Reinicie o Vite.

## Execução
Backend: `npm run dev` na porta 3333.
Frontend: `npm run dev` na porta 5173.

## Credenciais
`admin@dmcaffe.com.br` / `BaristaOS@123`

## Validação
- Login válido redireciona para `/abrir-caixa`.
- Login inválido mostra erro amigável.
- Atualizar a página mantém a sessão.
- `/mesas` sem sessão redireciona para login.
- Logout revoga o refresh token e limpa `baristaos.*` do Local Storage.
- Para testar refresh, invalide apenas `baristaos.access_token` e recarregue uma rota protegida.

## Segurança
Nesta etapa os tokens ficam no Local Storage. Antes da versão comercial pública, o refresh token deverá migrar para cookie HttpOnly/Secure.
