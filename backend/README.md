# BaristaOS API — Sprint 1

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
