import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import type {
  CreateRecipeInput,
  RecipeListQuery,
  UpdateRecipeInput
} from "./recipes.schemas.js";

const recipeInclude = {
  product: {
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      price: true,
      active: true,
      category: {
        select: { id: true, code: true, name: true }
      }
    }
  },
  items: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    include: {
      inventoryItem: {
        select: {
          id: true,
          name: true,
          category: true,
          unit: true,
          currentStock: true,
          minimumStock: true,
          unitCost: true,
          active: true
        }
      }
    }
  }
};

function serializeRecipe(recipe: any) {
  return {
    ...recipe,
    yieldQuantity: Number(recipe.yieldQuantity),
    product: recipe.product
      ? {
          ...recipe.product,
          price: Number(recipe.product.price)
        }
      : undefined,
    items:
      recipe.items?.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        wastePercent: Number(item.wastePercent),
        inventoryItem: item.inventoryItem
          ? {
              ...item.inventoryItem,
              currentStock: Number(item.inventoryItem.currentStock),
              minimumStock: Number(item.inventoryItem.minimumStock),
              unitCost: Number(item.inventoryItem.unitCost)
            }
          : undefined
      })) ?? []
  };
}

async function validateProduct(
  app: FastifyInstance,
  companyId: string,
  productId: string,
  ignoredRecipeId?: string
) {
  const product = await app.prisma.product.findFirst({
    where: { id: productId, companyId, active: true },
    select: { id: true }
  });

  if (!product) {
    throw new AppError(
      "Produto ativo não encontrado.",
      404,
      "RECIPE_PRODUCT_NOT_FOUND"
    );
  }

  const existing = await app.prisma.recipe.findFirst({
    where: {
      productId,
      ...(ignoredRecipeId ? { id: { not: ignoredRecipeId } } : {})
    },
    select: { id: true }
  });

  if (existing) {
    throw new AppError(
      "Este produto já possui uma ficha técnica.",
      409,
      "RECIPE_PRODUCT_ALREADY_LINKED"
    );
  }
}

async function validateInventoryItems(
  app: FastifyInstance,
  companyId: string,
  itemIds: string[]
) {
  const count = await app.prisma.inventoryItem.count({
    where: {
      companyId,
      active: true,
      id: { in: itemIds }
    }
  });

  if (count !== itemIds.length) {
    throw new AppError(
      "Um ou mais insumos não foram encontrados ou estão inativos.",
      422,
      "RECIPE_INVENTORY_ITEM_INVALID"
    );
  }
}

function mapItems(items: CreateRecipeInput["items"]) {
  return items.map((item, index) => ({
    inventoryItemId: item.inventoryItemId,
    quantity: item.quantity,
    wastePercent: item.wastePercent,
    sortOrder: item.sortOrder ?? index
  }));
}

export async function listRecipes(
  app: FastifyInstance,
  companyId: string,
  query: RecipeListQuery
) {
  const where: any = { companyId };

  if (query.active !== undefined) where.active = query.active;
  if (query.productId) where.productId = query.productId;
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { product: { is: { name: { contains: query.q, mode: "insensitive" } } } },
      { product: { is: { code: { contains: query.q, mode: "insensitive" } } } }
    ];
  }

  const [recipes, totalCount] = await app.prisma.$transaction([
    app.prisma.recipe.findMany({
      where,
      include: recipeInclude,
      orderBy: [{ active: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize
    }),
    app.prisma.recipe.count({ where })
  ]);

  return {
    data: recipes.map(serializeRecipe),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize))
    }
  };
}

export async function getRecipe(
  app: FastifyInstance,
  companyId: string,
  id: string
) {
  const recipe = await app.prisma.recipe.findFirst({
    where: { id, companyId },
    include: recipeInclude
  });

  if (!recipe) {
    throw new AppError(
      "Ficha técnica não encontrada.",
      404,
      "RECIPE_NOT_FOUND"
    );
  }

  return serializeRecipe(recipe);
}

export async function createRecipe(
  app: FastifyInstance,
  companyId: string,
  input: CreateRecipeInput
) {
  await validateProduct(app, companyId, input.productId);
  await validateInventoryItems(
    app,
    companyId,
    input.items.map(item => item.inventoryItemId)
  );

  const recipe = await app.prisma.recipe.create({
    data: {
      companyId,
      productId: input.productId,
      name: input.name,
      yieldQuantity: input.yieldQuantity,
      yieldUnit: input.yieldUnit,
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      active: input.active,
      items: { create: mapItems(input.items) }
    },
    include: recipeInclude
  });

  return serializeRecipe(recipe);
}

export async function updateRecipe(
  app: FastifyInstance,
  companyId: string,
  id: string,
  input: UpdateRecipeInput
) {
  const current = await app.prisma.recipe.findFirst({
    where: { id, companyId },
    select: { id: true, productId: true }
  });

  if (!current) {
    throw new AppError(
      "Ficha técnica não encontrada.",
      404,
      "RECIPE_NOT_FOUND"
    );
  }

  const productId = input.productId ?? current.productId;
  await validateProduct(app, companyId, productId, id);

  if (input.items) {
    await validateInventoryItems(
      app,
      companyId,
      input.items.map(item => item.inventoryItemId)
    );
  }

  const recipe = await app.prisma.$transaction(async tx => {
    if (input.items) {
      await tx.recipeItem.deleteMany({ where: { recipeId: id } });
    }

    return tx.recipe.update({
      where: { id },
      data: {
        ...(input.productId ? { productId: input.productId } : {}),
        ...(input.name ? { name: input.name } : {}),
        ...(input.yieldQuantity !== undefined
          ? { yieldQuantity: input.yieldQuantity }
          : {}),
        ...(input.yieldUnit ? { yieldUnit: input.yieldUnit } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
        ...(input.items ? { items: { create: mapItems(input.items) } } : {})
      },
      include: recipeInclude
    });
  });

  return serializeRecipe(recipe);
}

export async function deactivateRecipe(
  app: FastifyInstance,
  companyId: string,
  id: string
) {
  await getRecipe(app, companyId, id);

  await app.prisma.recipe.update({
    where: { id },
    data: { active: false }
  });
}
