import { z } from "zod";

export const addOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99),
  notes: z.string().trim().max(300).optional()
});
