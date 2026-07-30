import { z } from "zod";

const decimal = z.coerce.number().finite().min(0);
export const inventoryUnitSchema = z.enum(["KG", "G", "L", "ML", "UNIT"]);
export const createInventoryItemSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(80),
  unit: inventoryUnitSchema,
  currentStock: decimal.default(0),
  minimumStock: decimal.default(0),
  unitCost: decimal.default(0),
  supplier: z.string().trim().max(120).nullable().optional()
});
export const updateInventoryItemSchema = createInventoryItemSchema.partial().extend({ active: z.boolean().optional() });
export const inventoryItemParamsSchema = z.object({ id: z.string().uuid() });
export const inventoryListQuerySchema = z.object({
  q: z.string().trim().optional(), category: z.string().trim().optional(), lowStock: z.coerce.boolean().optional(), active: z.coerce.boolean().optional()
});
export const createMovementSchema = z.object({
  type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT"]),
  quantity: z.coerce.number().finite().min(0),
  note: z.string().trim().max(240).nullable().optional()
}).superRefine((value, ctx) => {
  if (value.type !== "ADJUSTMENT" && value.quantity <= 0) ctx.addIssue({ code: "custom", path: ["quantity"], message: "Informe uma quantidade maior que zero." });
});
export const movementListQuerySchema = z.object({ itemId: z.string().uuid().optional(), limit: z.coerce.number().int().min(1).max(200).default(100) });
