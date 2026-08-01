import { apiRequest } from "./http-client";
import type { InventoryUnit } from "./inventory.service";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export interface PurchaseOrderSupplier {
  id: string;
  corporateName: string;
  tradeName: string;
  document: string;
}

export interface PurchaseOrderUser {
  id: string;
  name: string;
}

export interface PurchaseOrderInventoryItem {
  id: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  unitCost: number;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  inventoryItem: PurchaseOrderInventoryItem;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  supplierId: string;
  createdById: string;
  number: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  notes: string | null;
  total: number;
  createdAt: string;
  updatedAt: string;
  supplier: PurchaseOrderSupplier;
  createdBy: PurchaseOrderUser;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemInput {
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  orderDate?: string;
  notes?: string | null;
  items: PurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput {
  supplierId?: string;
  orderDate?: string;
  notes?: string | null;
  items?: PurchaseOrderItemInput[];
}

export interface PurchaseOrderListParams {
  q?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface PurchaseOrderPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  pagination: PurchaseOrderPagination;
}

export const purchasesService = {
  list(params?: PurchaseOrderListParams) {
    return apiRequest<PurchaseOrderListResponse>({
      method: "GET",
      url: "/purchases",
      params,
    });
  },

  get(id: string) {
    return apiRequest<PurchaseOrder>({
      method: "GET",
      url: `/purchases/${id}`,
    });
  },

  create(data: CreatePurchaseOrderInput) {
    return apiRequest<PurchaseOrder>({
      method: "POST",
      url: "/purchases",
      data,
    });
  },

  update(id: string, data: UpdatePurchaseOrderInput) {
    return apiRequest<PurchaseOrder>({
      method: "PATCH",
      url: `/purchases/${id}`,
      data,
    });
  },

  send(id: string) {
    return apiRequest<PurchaseOrder>({
      method: "POST",
      url: `/purchases/${id}/send`,
    });
  },

  cancel(id: string) {
    return apiRequest<PurchaseOrder>({
      method: "POST",
      url: `/purchases/${id}/cancel`,
    });
  },
};
