import { z } from "zod";

export const orderPaymentParamsSchema = z.object({
  id: z.string().uuid()
});

const paymentSchema = z.object({
  method: z.enum(["CASH", "PIX", "TEF_CREDIT", "TEF_DEBIT", "COURTESY"]),
  amount: z.coerce.number().positive().max(999999.99)
});

export const registerPaymentsSchema = z.object({
  payments: z.array(paymentSchema).min(1).max(10)
});

export type RegisterPaymentInput = z.infer<typeof paymentSchema>;
