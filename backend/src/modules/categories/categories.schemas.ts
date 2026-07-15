import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().min(2).max(30).transform(value => value.toUpperCase()),
  sortOrder: z.coerce.number().int().min(0).default(0)
});
