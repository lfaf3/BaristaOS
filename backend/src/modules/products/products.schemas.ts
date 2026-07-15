import { z } from "zod";

export const productListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  favorites: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50)
});

export const productParamsSchema = z.object({ id: z.string().uuid() });

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  code: z.string().trim().min(1).max(30),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  price: z.coerce.number().positive().max(999999.99),
  aliases: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  favorite: z.boolean().default(false)
});

export const updateProductSchema = createProductSchema.partial().refine(
  value => Object.keys(value).length > 0,
  "Informe ao menos um campo para atualização."
);
