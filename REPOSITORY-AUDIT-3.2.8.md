# Auditoria do repositório — v3.2.8

## Objetivo

Reduzir duplicidade e ambiguidade sem alterar o comportamento funcional validado do BaristaOS.

## Removidos com segurança

### Backend

- Arquivos `.js` dentro de `backend/src/` e `backend/tests/` que eram espelhos compilados dos `.ts`.
- Módulos soltos em `backend/` que duplicavam arquivos oficiais de `backend/src/`.
- `backend/schema.prisma`, mantendo somente `backend/prisma/schema.prisma`.
- `backend/migration*.sql`, mantendo somente o histórico oficial em `backend/prisma/migrations/`.
- Cópias de `prisma.config.js` e `prisma/seed.js`, mantendo as versões TypeScript.
- READMEs e documentos de sprint duplicados na raiz, mantendo `backend/docs/`.
- Arquivos de download sem extensão e testes soltos com nomes incorretos.

### Frontend

- `package (1).json`, `package-lock (1).json` e `tsconfig (1).json`.
- `download (1)`.
- `tsconfig.app.tsbuildinfo`, por ser artefato de compilação.
- Dados mockados não importados em `src/components/data/` e `src/data/tables.ts`.

## Mantidos intencionalmente

- Todos os arquivos TypeScript usados pelos scripts de desenvolvimento e build.
- `frontend/src/styles.release-3.1.css`, pois ainda é importado por `main.tsx`.
- READMEs específicos dos módulos, por documentarem contratos locais.
- ADRs e documentos em `backend/docs/`.
- Todas as migrations ordenadas em `backend/prisma/migrations/`.
- Arquivos `RELEASE-*`, por registrarem o histórico de versões.

## Estrutura oficial

```text
backend/
  prisma/
    migrations/
    schema.prisma
    seed.ts
  src/
    config/
    modules/
    plugins/
    shared/
  tests/

frontend/
  public/
  src/
    app/
    components/
    data/
    pages/
    services/
    styles/
    types/
    utils/
```

## Recomendações futuras

- Consolidar `styles.release-3.1.css` em `styles/global.css` em uma sprint visual dedicada.
- Adicionar testes de integração com banco temporário para os fluxos de pagamento e liberação.
- Criar `ARCHITECTURE.md` no marco v4.0.0.
- Adotar lint e formatação também no frontend.
