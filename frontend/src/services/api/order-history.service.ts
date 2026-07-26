import { apiRequest } from "./http-client";

export type HistoryPaymentMethod =
  | "CASH"
  | "PIX"
  | "TEF_CREDIT"
  | "TEF_DEBIT"
  | "COURTESY";

export interface OrderHistoryPayment {
  id: string;
  method: HistoryPaymentMethod;
  amount: number;
  approvedAt: string | null;
}

export interface OrderHistorySummary {
  id: string;
  status: "PAID";
  table: { id: string; number: number; name: string | null } | null;
  operator: { id: string; name: string };
  guestCount: number;
  itemCount: number;
  subtotal: number;
  discount: number;
  serviceChargePercentage: number;
  serviceCharge: number;
  total: number;
  openedAt: string;
  closedAt: string | null;
  notes: string | null;
  payments: OrderHistoryPayment[];
}

export interface OrderHistoryItem {
  id: string;
  productId: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}

export interface OrderHistoryDetail extends Omit<OrderHistorySummary, "itemCount"> {
  items: OrderHistoryItem[];
}

export interface OrderHistoryResponse {
  data: OrderHistorySummary[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  tableNumber?: number;
  page?: number;
  pageSize?: number;
}

export const orderHistoryService = {
  list(filters: HistoryFilters = {}) {
    return apiRequest<OrderHistoryResponse>({
      method: "GET",
      url: "/orders/history",
      params: filters
    });
  },

  getById(id: string) {
    return apiRequest<OrderHistoryDetail>({
      method: "GET",
      url: `/orders/history/${id}`
    });
  }
};
