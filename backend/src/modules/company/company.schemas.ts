import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

export const updateCompanySchema = z.object({
  name: z.string().trim().min(2).max(160),
  tradeName: z.string().trim().min(2).max(160),
  document: z.string().trim().min(11).max(20),
  stateRegistration: optionalText(30),
  taxRegime: optionalText(60),
  cnae: optionalText(20),
  postalCode: optionalText(10),
  street: optionalText(160),
  addressNumber: optionalText(20),
  addressComplement: optionalText(80),
  neighborhood: optionalText(100),
  city: optionalText(100),
  state: z.string().trim().max(2).nullable().optional(),
  phone: optionalText(25),
  whatsapp: optionalText(25),
  email: z.string().trim().email().max(160).nullable().optional().or(z.literal("")),
  website: optionalText(200),
  displayName: optionalText(100),
  logoDataUrl: z.string().max(2_000_000).regex(/^data:image\/(png|jpeg|webp);base64,/).nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  receiptFooter: z.string().trim().max(240),
  printLogo: z.boolean(),
  printDocument: z.boolean(),
  printAddress: z.boolean(),
  printPhone: z.boolean(),
  language: z.enum(["pt-BR"]),
  currency: z.enum(["BRL"]),
  timezone: z.string().trim().min(1).max(80)
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
