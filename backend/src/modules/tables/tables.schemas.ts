import { z } from "zod";

export const tableParamsSchema = z.object({ id: z.string().uuid() });
export const updateTableStatusSchema = z.object({
  status: z.enum(["FREE", "OPEN", "PAYMENT", "BLOCKED"])
});
