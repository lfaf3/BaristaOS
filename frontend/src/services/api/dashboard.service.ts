import { apiRequest } from "./http-client";

export type DashboardPaymentMethod = "CASH" | "PIX" | "TEF_CREDIT" | "TEF_DEBIT" | "COURTESY";

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
  operation: { openOrders: number; paidOrders: number; averageServiceMinutes: number };
  goal: { target: number; achieved: number; percentage: number };
  highlights: {
    topProduct: { id: string; name: string; quantity: number; revenue: number } | null;
    mainPaymentMethod: { method: DashboardPaymentMethod; amount: number; transactions: number } | null;
    mostUsedTable: { number: number; orders: number } | null;
  };
  tables: { total: number; free: number; inService: number; awaitingPayment: number; blocked: number };
  salesTrend: Array<{ date: string; label: string; revenue: number }>;
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  alerts: Array<{
    id: string;
    type: "TABLE" | "ORDER";
    title: string;
    message: string;
    severity: "MEDIUM" | "HIGH";
  }>;
  activities: Array<{
    id: string;
    type: "PAYMENT" | "ITEM";
    title: string;
    description: string;
    occurredAt: string;
  }>;
}

export const dashboardService = {
  getSummary() {
    return apiRequest<DashboardSummary>({ method: "GET", url: "/dashboard/summary" });
  }
};
