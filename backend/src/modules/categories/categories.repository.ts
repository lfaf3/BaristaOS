import type { FastifyInstance } from "fastify";

export function listCategories(app: FastifyInstance, companyId: string) {
  return app.prisma.category.findMany({
    where: { companyId, active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, code: true, name: true, sortOrder: true }
  });
}

export function createCategory(
  app: FastifyInstance,
  companyId: string,
  data: { name: string; code: string; sortOrder: number }
) {
  return app.prisma.category.create({
    data: { companyId, ...data },
    select: { id: true, code: true, name: true, sortOrder: true, active: true }
  });
}
