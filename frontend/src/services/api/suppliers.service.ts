import { apiRequest } from "./http-client";

export interface Supplier {
  id: string;
  companyId: string;
  corporateName: string;
  tradeName: string;
  document: string;
  stateRegistration: string | null;
  municipalRegistration: string | null;
  contactName: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  zipCode: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInput {
  corporateName: string;
  tradeName: string;
  document: string;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  contactName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  zipCode?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  active?: boolean;
}

export async function list(params?: { q?: string; active?: boolean }) {
  return apiRequest<Supplier[]>({
    method: "GET",
    url: "/suppliers",
    params,
  });
}

export async function get(id: string) {
  return apiRequest<Supplier>({ method: "GET", url: `/suppliers/${id}` });
}

export async function create(data: SupplierInput) {
  return apiRequest<Supplier>({ method: "POST", url: "/suppliers", data });
}

export async function update(id: string, data: Partial<SupplierInput>) {
  return apiRequest<Supplier>({ method: "PATCH", url: `/suppliers/${id}`, data });
}

export async function remove(id: string) {
  return apiRequest<void>({ method: "DELETE", url: `/suppliers/${id}` });
}
