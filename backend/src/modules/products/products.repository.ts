import type { FastifyInstance } from "fastify";

export function findProducts(
  app: FastifyInstance,
  companyId: string,
  filters: { categoryId?: string | undefined; favorites?: boolean | undefined }
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
  description?: string | undefined;
  price: number;
  aliases: string[];
  favorite: boolean;
}

export type ProductUpdateInput = {
  categoryId?: string | undefined;
  code?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  aliases?: string[] | undefined;
  favorite?: boolean | undefined;
};

export function createProduct(app: FastifyInstance, companyId: string, data: ProductWriteInput) {
  return app.prisma.product.create({
    data: {
      companyId,
      categoryId: data.categoryId,
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      aliases: data.aliases,
      favorite: data.favorite
    },
    include: { category: { select: { id: true, code: true, name: true } } }
  });
}

export function updateProduct(app: FastifyInstance, id: string, data: ProductUpdateInput) {
  const updateData: {
    categoryId?: string;
    code?: string;
    name?: string;
    description?: string | null;
    price?: number;
    aliases?: string[];
    favorite?: boolean;
  } = {};

  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.name !== undefined) updateData.name = data.name;
  if (Object.prototype.hasOwnProperty.call(data, "description")) updateData.description = data.description ?? null;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.aliases !== undefined) updateData.aliases = data.aliases;
  if (data.favorite !== undefined) updateData.favorite = data.favorite;

  return app.prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: { select: { id: true, code: true, name: true } } }
  });
}
