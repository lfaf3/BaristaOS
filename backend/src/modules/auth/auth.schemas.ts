import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(4),
  storeId: z.string().uuid().optional()
});
export const refreshSchema = z.object({ refreshToken: z.string().min(20) });
export type LoginInput = z.infer<typeof loginSchema>;
