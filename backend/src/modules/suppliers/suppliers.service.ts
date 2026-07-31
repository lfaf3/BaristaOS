import type { FastifyInstance } from "fastify";
import {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "./suppliers.schemas";

function removeUndefinedFields<T extends Record<string, unknown>>(data: T): T {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) payload[key] = value;
  }
  return payload as T;
}

export async function listSuppliers(app: FastifyInstance, companyId: string, query?: { q?: string | undefined; active?: boolean | undefined }) {
  const where: any = { companyId };
  if (typeof query?.active === "boolean") where.active = query.active;
  else where.active = true;
  if (query?.q) {
    where.OR = [
      { corporateName: { contains: query.q, mode: "insensitive" } },
      { tradeName: { contains: query.q, mode: "insensitive" } },
      { document: { contains: query.q, mode: "insensitive" } },
    ];
  }
  return app.prisma.supplier.findMany({
    where,
    orderBy: { tradeName: "asc" },
  });
}

export async function getSupplier(
  app: FastifyInstance,
  companyId: string,
  id: string,
) {
  return app.prisma.supplier.findFirst({
    where: { id, companyId },
  });
}

export async function createSupplier(
  app: FastifyInstance,
  companyId: string,
  data: CreateSupplierInput,
) {
  return app.prisma.supplier.create({
    data: removeUndefinedFields({ ...data, companyId }) as any,
  });
}

export async function updateSupplier(
  app: FastifyInstance,
  companyId: string,
  id: string,
  data: UpdateSupplierInput,
) {
  return app.prisma.supplier.update({
    where: { id },
    data: removeUndefinedFields(data) as any,
  });
}

export async function deactivateSupplier(
  app: FastifyInstance,
  companyId: string,
  id: string,
) {
  return app.prisma.supplier.update({
    where: { id },
    data: { active: false },
  });
}
