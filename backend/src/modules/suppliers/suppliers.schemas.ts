import { z } from "zod";

export const supplierSchema = z.object({
  corporateName: z.string().min(2).max(150),
  tradeName: z.string().min(2).max(150),
  document: z.string().min(1).max(18),

  stateRegistration: z.string().max(30).optional().nullable(),
  municipalRegistration: z.string().max(30).optional().nullable(),

  contactName: z.string().max(120).optional().nullable(),

  phone: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),

  zipCode: z.string().max(12).optional().nullable(),

  address: z.string().max(150).optional().nullable(),
  number: z.string().max(20).optional().nullable(),
  complement: z.string().max(120).optional().nullable(),

  district: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().length(2).optional().nullable(),

  notes: z.string().max(1000).optional().nullable(),

  active: z.boolean().optional()
});

export const updateSupplierSchema = supplierSchema.partial();

export const supplierIdSchema = z.object({
  id: z.string().uuid()
});

export const supplierQuerySchema = z.object({
  q: z.string().optional(),
  active: z.coerce.boolean().optional()
});

export const createSupplierSchema = supplierSchema;
export const supplierIdParamsSchema = supplierIdSchema;
export const supplierListQuerySchema = supplierQuerySchema;

export type CreateSupplierInput = z.infer<typeof supplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
