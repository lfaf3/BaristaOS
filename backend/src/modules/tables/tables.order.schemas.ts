import { z } from "zod";

export const orderItemParamsSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid()
});

export const addOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99),
  notes: z.string().trim().max(300).optional()
});

export const updateOrderItemSchema = z
  .object({
    quantity: z.coerce.number().int().min(1).max(99).optional(),
    notes: z.string().trim().max(300).nullable().optional()
  })
  .refine(input => input.quantity !== undefined || input.notes !== undefined, {
    message: "Informe a quantidade ou a observação."
  });


export const closeTableOrderSchema = z.object({
  discount: z.coerce.number().min(0).max(999999.99).default(0),
  serviceChargePercentage: z.coerce.number().min(0).max(100).default(10)
});
