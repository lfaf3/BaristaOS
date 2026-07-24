# ADR-0001 — Stack do backend

## Status
Aceita.

## Decisão
Node.js LTS, TypeScript, Fastify, PostgreSQL, Prisma ORM, Zod, JWT,
Vitest e Docker Compose.

## Motivo
O domínio de caixa, pedidos e pagamentos é transacional e relacional.
A stack mantém TypeScript no frontend e backend e oferece migrations tipadas.
