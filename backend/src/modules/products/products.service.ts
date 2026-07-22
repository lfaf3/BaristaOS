import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import * as repository from "./products.repository.js";
import type { ProductWriteInput, ProductUpdateInput } from "./products.repository.js";

type ProductListInput = {
  q?: string | undefined;
  categoryId?: string | undefined;
  favorites?: boolean | undefined;
  page: number;
  pageSize: number;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function serialize(product: Awaited<ReturnType<typeof repository.findProductById>>) {
  if (!product) return null;
  return { ...product, price: Number(product.price) };
}

export async function listProducts(app: FastifyInstance, companyId: string, input: ProductListInput) {
  const products = await repository.findProducts(app, companyId, input);
  const query = input.q ? normalize(input.q) : undefined;
  const filtered = query
    ? products.filter(product => normalize([
        product.code, product.name, product.category.name, ...product.aliases
      ].join(" ")).includes(query))
    : products;
  const start = (input.page - 1) * input.pageSize;
  return {
    data: filtered.slice(start, start + input.pageSize).map(product => ({ ...product, price: Number(product.price) })),
    meta: { page: input.page, pageSize: input.pageSize, total: filtered.length }
  };
}

export async function getProduct(app: FastifyInstance, companyId: string, id: string) {
  const product = await repository.findProductById(app, companyId, id);
  if (!product) throw new AppError("Produto não encontrado.", 404, "PRODUCT_NOT_FOUND");
  return serialize(product);
}

export async function addProduct(app: FastifyInstance, companyId: string, input: ProductWriteInput) {
  if (!(await repository.findCategory(app, companyId, input.categoryId))) {
    throw new AppError("Categoria não encontrada.", 404, "CATEGORY_NOT_FOUND");
  }
  try {
    const product = await repository.createProduct(app, companyId, input);
    return { ...product, price: Number(product.price) };
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      throw new AppError("Já existe um produto com esse código.", 409, "PRODUCT_CODE_EXISTS");
    }
    throw error;
  }
}

export async function editProduct(app: FastifyInstance, companyId: string, id: string, input: ProductUpdateInput) {
  await getProduct(app, companyId, id);
  if (typeof input.categoryId === "string" && !(await repository.findCategory(app, companyId, input.categoryId))) {
    throw new AppError("Categoria não encontrada.", 404, "CATEGORY_NOT_FOUND");
  }
  try {
    const product = await repository.updateProduct(app, id, input);
    return { ...product, price: Number(product.price) };
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      throw new AppError("Já existe um produto com esse código.", 409, "PRODUCT_CODE_EXISTS");
    }
    throw error;
  }
}
