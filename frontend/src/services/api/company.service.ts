import { apiRequest } from "./http-client";

export interface CompanySettings {
  id: string;
  name: string;
  tradeName: string;
  document: string;
  stateRegistration: string | null;
  taxRegime: string | null;
  cnae: string | null;
  postalCode: string | null;
  street: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  displayName: string | null;
  logoDataUrl: string | null;
  primaryColor: string;
  receiptFooter: string;
  printLogo: boolean;
  printDocument: boolean;
  printAddress: boolean;
  printPhone: boolean;
  language: "pt-BR";
  currency: "BRL";
  timezone: string;
  updatedAt: string;
}

export type UpdateCompanyInput = Omit<CompanySettings, "id" | "updatedAt">;

export const companyService = {
  get: () => apiRequest<CompanySettings>({ method: "GET", url: "/company" }),
  update: (input: UpdateCompanyInput) => apiRequest<CompanySettings>({ method: "PUT", url: "/company", data: input })
};
