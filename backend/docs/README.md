# BaristaOS API — Sprint 2

## Conteúdo
Fastify, TypeScript, PostgreSQL, Prisma 7, autenticação JWT, refresh token,
seed inicial, health checks e testes.

## Requisitos
- Node.js 22 ou superior
- Docker Desktop

## Executar no Windows

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

API: `http://localhost:3333`

## Login de desenvolvimento
- E-mail: `admin@dmcaffe.com.br`
- Senha: `BaristaOS@123`

## Rotas
- `GET /api/v1/health`
- `GET /api/v1/ready`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/me` com Bearer token

### Login
```json
{
  "email": "admin@dmcaffe.com.br",
  "password": "BaristaOS@123"
}
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run test`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:studio`

## Próxima sprint
Categorias, produtos, mesas e abertura/fechamento de caixa.


## Endpoints da Sprint 2

```text
GET    /api/v1/categories
POST   /api/v1/categories
GET    /api/v1/products?q=cap&favorites=true
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
GET    /api/v1/tables
GET    /api/v1/tables/:id
PATCH  /api/v1/tables/:id/status
GET    /api/v1/cash/current
POST   /api/v1/cash/open
POST   /api/v1/cash/close
```

Todas essas rotas exigem `Authorization: Bearer ACCESS_TOKEN`.
