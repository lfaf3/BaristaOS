# ADR-0002 — Multiempresa por coluna

## Status
Aceita.

Toda consulta operacional deverá ser limitada por `companyId` e `storeId`
obtidos do token. O MVP não terá banco separado por cliente.
