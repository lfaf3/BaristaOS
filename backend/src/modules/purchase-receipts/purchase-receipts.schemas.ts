import { z } from "zod";

const receiptItemSchema = z.object({
  purchaseOrderItemId: z.string().uuid(),
  quantity: z.coerce.number().finite().positive().max(999999999),
  unitCost: z.coerce.number().finite().min(0).max(999999999).optional()
});

export const createPurchaseReceiptSchema = z.object({
  receivedAt: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  items: z.array(receiptItemSchema).min(1).max(200)
}).superRefine((value, ctx) => {
  const ids = value.items.map(item => item.purchaseOrderItemId);

  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({
      code: "custom",
      path: ["items"],
      message: "O mesmo item do pedido não pode ser recebido mais de uma vez na mesma operação."
    });
  }
});

export const purchaseReceiptOrderParamsSchema = z.object({
  id: z.string().uuid()
});

export type CreatePurchaseReceiptInput = z.infer<typeof createPurchaseReceiptSchema>;
