import { z } from "zod";

export const tableParamsSchema = z.object({ id: z.string().uuid() });

export const openTableSchema = z.object({
  identifier: z.string().trim().max(30).optional().default("")
});
export const updateTableStatusSchema = z.object({
  status: z.enum(["FREE", "OPEN", "PAYMENT", "READY_TO_CLOSE", "BLOCKED"])
});
