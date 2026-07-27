import { apiRequest } from "./http-client";

export type DashboardPaymentMethod =
  | "CASH"
  | "PIX"
  | "TEF_CREDIT"
  | "TEF_DEBIT"
  | "COURTESY";

export interface DashboardSummary {
  generatedAt: string;
  period: { start: string; end: string };
  sales: {
    revenue: number;
    orderCount: number;
    averageTicket: number;
    revenueChangePercentage: number;
    orderCountChangePercentage: number;
  };
  highlights: {
    topProduct: { id: string; name: string; quantity: number } | null;
    mainPaymentMethod: {
      method: DashboardPaymentMethod;
      amount: number;
      transactions: number;
    } | null;
    mostUsedTable: { number: number; orders: number } | null;
  };
  tables: { total: number; free: number; inService: number; blocked: number };
}

export const dashboardService = {
  getSummary() {
    return apiRequest<DashboardSummary>({
      method: "GET",
      url: "/dashboard/summary"
    });
  }
};
