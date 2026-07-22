import type { TableOrder } from "../../types";
import { apiRequest } from "./http-client";

interface TableOrderApiResponse {
  table: {
    id: string;
    number: number;
    name: string | null;
    status: "OPEN" | "PAYMENT";
    seats: number;
    people: number;
    openedAt: string | null;
    minutesOpen: number;
  };
  order: {
    id: string;
    guestCount: number;
    openedAt: string;
    notes: string | null;
    subtotal: number;
    discount: number;
    serviceCharge: number;
    total: number;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    code: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes: string | null;
  }>;
  subtotal: number;
  discount: number;
  serviceCharge: number;
  total: number;
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
  }
};
