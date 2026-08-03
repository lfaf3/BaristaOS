import type { TableOrder } from "../../types";
import { apiRequest } from "./http-client";

interface TableOrderApiResponse extends TableOrder {}

export type TefTransactionStatus = "PENDING" | "PROCESSING" | "AUTHORIZED" | "CONFIRMED" | "DECLINED" | "CANCELLED" | "FAILED" | "UNKNOWN";

interface TefTransactionResponse {
  transaction: {
    id: string;
    provider: string;
    method: "TEF_CREDIT" | "TEF_DEBIT";
    status: TefTransactionStatus;
    amount: number;
    nsu: string | null;
    authorizationCode: string | null;
    cardBrand: string | null;
    errorMessage: string | null;
  };
  order: TableOrder | null;
}

export const ordersService = {
  getByTable(tableId: string): Promise<TableOrder> {
    return apiRequest<TableOrderApiResponse>({
      method: "GET",
      url: `/tables/${tableId}/order`
    });
  },

  addItem(
    tableId: string,
    input: { productId: string; quantity: number; notes?: string }
  ): Promise<TableOrder> {
    return apiRequest<TableOrderApiResponse>({
      method: "POST",
      url: `/tables/${tableId}/order/items`,
      data: input
    });
  },

  updateItem(
    tableId: string,
    itemId: string,
    input: { quantity?: number; notes?: string | null }
  ): Promise<TableOrder> {
    return apiRequest<TableOrderApiResponse>({
      method: "PATCH",
      url: `/tables/${tableId}/order/items/${itemId}`,
      data: input
    });
  },

  close(
    tableId: string,
    input: { discount: number; serviceChargePercentage: number }
  ): Promise<TableOrder> {
    return apiRequest<TableOrderApiResponse>({
      method: "PATCH",
      url: `/tables/${tableId}/order/close`,
      data: input
    });
  },

  pay(
    orderId: string,
    payments: Array<{ method: "CASH" | "PIX" | "TEF_CREDIT" | "TEF_DEBIT" | "COURTESY"; amount: number }>
  ): Promise<TableOrder> {
    return apiRequest<TableOrderApiResponse>({
      method: "POST",
      url: `/orders/${orderId}/payments`,
      data: { payments }
    });
  },

  startTef(
    orderId: string,
    input: {
      method: "TEF_CREDIT" | "TEF_DEBIT";
      amount: number;
      installments?: number;
      idempotencyKey: string;
    }
  ): Promise<TefTransactionResponse> {
    return apiRequest<TefTransactionResponse>({
      method: "POST",
      url: `/orders/${orderId}/tef/transactions`,
      data: input
    });
  },

  cancel(tableId: string, reason: string): Promise<{ message: string; tableId: string }> {
    return apiRequest<{ message: string; tableId: string }>({
      method: "PATCH",
      url: `/tables/${tableId}/order/cancel`,
      data: { reason }
    });
  },

  deleteItem(tableId: string, itemId: string): Promise<TableOrder> {
    return apiRequest<TableOrderApiResponse>({
      method: "DELETE",
      url: `/tables/${tableId}/order/items/${itemId}`
    });
  }
};
