import { z } from "zod";

export const openCashSchema = z.object({
  openingAmount: z.coerce.number().min(0).max(999999.99),
  note: z.string().trim().max(300).optional()
});

export const closeCashSchema = z.object({
  closingAmount: z.coerce.number().min(0).max(999999.99),
  note: z.string().trim().max(300).optional()
});
