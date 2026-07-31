import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "./suppliers.schemas";

export async function listSuppliers(app: FastifyInstance, companyId: string) {
  return app.prisma.supplier.findMany({
    where: { companyId, active: true },
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
    data: { ...data, companyId },
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
    data,
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
