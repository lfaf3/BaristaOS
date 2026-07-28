import type { TableOrder } from "../../types";
import { apiRequest } from "./http-client";

interface TableOrderApiResponse extends TableOrder {}

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
