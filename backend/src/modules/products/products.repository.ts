import type { FastifyInstance } from "fastify";

export function findProducts(
  app: FastifyInstance,
  companyId: string,
  filters: { categoryId?: string; favorites?: boolean }
) {
  return app.prisma.product.findMany({
    where: {
      companyId,
      active: true,
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.favorites !== undefined ? { favorite: filters.favorites } : {})
    },
    include: { category: { select: { id: true, code: true, name: true } } },
    orderBy: [{ favorite: "desc" }, { name: "asc" }]
  });
}

export function findProductById(app: FastifyInstance, companyId: string, id: string) {
  return app.prisma.product.findFirst({
    where: { id, companyId, active: true },
    include: { category: { select: { id: true, code: true, name: true } } }
  });
}

export function findCategory(app: FastifyInstance, companyId: string, id: string) {
  return app.prisma.category.findFirst({ where: { id, companyId, active: true } });
}

export interface ProductWriteInput {
  categoryId: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  aliases: string[];
  favorite: boolean;
}

export function createProduct(app: FastifyInstance, companyId: string, data: ProductWriteInput) {
  return app.prisma.product.create({
    data: { companyId, ...data },
    include: { category: { select: { id: true, code: true, name: true } } }
  });
}

export function updateProduct(app: FastifyInstance, id: string, data: Partial<ProductWriteInput>) {
  return app.prisma.product.update({
    where: { id }, data,
    include: { category: { select: { id: true, code: true, name: true } } }
  });
}
