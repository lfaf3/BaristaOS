import { z } from "zod";

const dateSchema = z.string().date();

export const orderHistoryQuerySchema = z
  .object({
    dateFrom: dateSchema.optional(),
    dateTo: dateSchema.optional(),
    tableNumber: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
  })
  .refine(
    value => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo,
    { message: "A data inicial não pode ser posterior à data final." }
  );

export const orderHistoryParamsSchema = z.object({
  id: z.string().uuid()
});
