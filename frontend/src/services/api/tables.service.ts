import type { CafeTable, TableStatus } from "../../types";
import { apiRequest } from "./http-client";

interface TableApiResponse {
  id: string;
  number: number;
  name: string | null;
  status: "FREE" | "OPEN" | "PAYMENT" | "BLOCKED";
  seats: number;
  people: number;
  items: number;
  total: number;
  minutesOpen: number;
}

function mapStatus(status: TableApiResponse["status"]): TableStatus {
  const statusMap: Record<TableApiResponse["status"], TableStatus> = {
    FREE: "free",
    OPEN: "open",
    PAYMENT: "payment",
    BLOCKED: "blocked"
  };

  return statusMap[status];
}

function mapTable(table: TableApiResponse): CafeTable {
  return {
    id: table.id,
    number: table.number,
    name: table.name,
    status: mapStatus(table.status),
    seats: table.seats,
    amount: table.total,
    minutes: table.minutesOpen,
    people: table.people,
    items: table.items
  };
}

export const tablesService = {
  async list(): Promise<CafeTable[]> {
    const tables = await apiRequest<TableApiResponse[]>({
      method: "GET",
      url: "/tables"
    });

    return tables.map(mapTable);
  }
};
