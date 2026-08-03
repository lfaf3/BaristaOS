import { z } from "zod";

export const tefOrderParamsSchema = z.object({ id: z.string().uuid() });
export const tefTransactionParamsSchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid()
});

export const startTefTransactionSchema = z.object({
  method: z.enum(["TEF_CREDIT", "TEF_DEBIT"]),
  amount: z.coerce.number().positive().max(999999.99),
  installments: z.coerce.number().int().min(1).max(24).optional(),
  idempotencyKey: z.string().trim().min(8).max(100)
});

export type StartTefTransactionInput = z.infer<typeof startTefTransactionSchema>;
