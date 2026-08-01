import { z } from "zod";

export const purchaseOrderStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED"
]);

const nullableText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

const purchaseItemSchema = z.object({
  inventoryItemId: z.string().uuid(),
  quantity: z.coerce.number().finite().positive().max(999999999),
  unitPrice: z.coerce.number().finite().min(0).max(999999999)
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  orderDate: z.coerce.date().optional(),
  notes: nullableText(1000),
  items: z.array(purchaseItemSchema).max(200).default([])
}).superRefine((value, ctx) => {
  const ids = value.items.map(item => item.inventoryItemId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({
      code: "custom",
      path: ["items"],
      message: "O mesmo item de estoque não pode ser incluído mais de uma vez."
    });
  }
});

export const updatePurchaseOrderSchema = z.object({
  supplierId: z.string().uuid().optional(),
  orderDate: z.coerce.date().optional(),
  notes: nullableText(1000),
  items: z.array(purchaseItemSchema).max(200).optional()
}).superRefine((value, ctx) => {
  if (!value.items) return;
  const ids = value.items.map(item => item.inventoryItemId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({
      code: "custom",
      path: ["items"],
      message: "O mesmo item de estoque não pode ser incluído mais de uma vez."
    });
  }
});

export const purchaseOrderParamsSchema = z.object({
  id: z.string().uuid()
});

export const purchaseOrderListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  supplierId: z.string().uuid().optional(),
  status: purchaseOrderStatusSchema.optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
}).refine(
  value => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo,
  { message: "A data inicial não pode ser posterior à data final." }
);

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type PurchaseOrderListQuery = z.infer<typeof purchaseOrderListQuerySchema>;
