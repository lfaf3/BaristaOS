import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import type { UpdateCompanyInput } from "./company.schemas.js";

const select = {
  id: true, name: true, tradeName: true, document: true,
  stateRegistration: true, taxRegime: true, cnae: true,
  postalCode: true, street: true, addressNumber: true, addressComplement: true,
  neighborhood: true, city: true, state: true, phone: true, whatsapp: true,
  email: true, website: true, displayName: true, logoDataUrl: true,
  primaryColor: true, receiptFooter: true, printLogo: true, printDocument: true,
  printAddress: true, printPhone: true, language: true, currency: true, timezone: true,
  updatedAt: true
} as const;

export async function getCompany(app: FastifyInstance, companyId: string) {
  const company = await app.prisma.company.findUnique({ where: { id: companyId }, select });
  if (!company) throw new AppError("Empresa não encontrada.", 404, "COMPANY_NOT_FOUND");
  return company;
}

export async function updateCompany(app: FastifyInstance, companyId: string, input: UpdateCompanyInput) {
  const clean = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value === "" ? null : value]));
  try {
    return await app.prisma.company.update({ where: { id: companyId }, data: clean, select });
  } catch (error: any) {
    if (error?.code === "P2025") throw new AppError("Empresa não encontrada.", 404, "COMPANY_NOT_FOUND");
    if (error?.code === "P2002") throw new AppError("Já existe uma empresa com este CNPJ.", 409, "COMPANY_DOCUMENT_ALREADY_EXISTS");
    throw error;
  }
}
