import { z } from "zod";

const nullableText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

const recipeItemSchema = z.object({
  inventoryItemId: z.string().uuid(),
  quantity: z.coerce.number().finite().positive().max(999999999),
  wastePercent: z.coerce.number().finite().min(0).max(100).default(0),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
});

function validateUniqueIngredients(
  value: { items?: Array<{ inventoryItemId: string }> | undefined },
  ctx: z.RefinementCtx
) {
  if (!value.items) return;

  const ids = value.items.map(item => item.inventoryItemId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({
      code: "custom",
      path: ["items"],
      message: "O mesmo insumo não pode ser incluído mais de uma vez."
    });
  }
}

export const createRecipeSchema = z
  .object({
    productId: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    yieldQuantity: z.coerce.number().finite().positive().max(999999999),
    yieldUnit: z.enum(["KG", "G", "L", "ML", "UNIT"]),
    notes: nullableText(1000),
    active: z.boolean().default(true),
    items: z.array(recipeItemSchema).min(1).max(200)
  })
  .superRefine(validateUniqueIngredients);

export const updateRecipeSchema = z
  .object({
    productId: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(120).optional(),
    yieldQuantity: z.coerce.number().finite().positive().max(999999999).optional(),
    yieldUnit: z.enum(["KG", "G", "L", "ML", "UNIT"]).optional(),
    notes: nullableText(1000),
    active: z.boolean().optional(),
    items: z.array(recipeItemSchema).min(1).max(200).optional()
  })
  .superRefine(validateUniqueIngredients);

export const recipeParamsSchema = z.object({
  id: z.string().uuid()
});

export const recipeListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  productId: z.string().uuid().optional(),
  active: z
    .enum(["true", "false"])
    .transform(value => value === "true")
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type RecipeListQuery = z.infer<typeof recipeListQuerySchema>;
