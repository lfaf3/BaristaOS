import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

function mapTable(table: {
  id: string; number: number; name: string | null; status: string; seats: number;
  orders: Array<{ openedAt: Date; guestCount: number; total: unknown; items: Array<{ quantity: number }> }>;
}) {
  const order = table.orders[0];
  return {
    id: table.id,
    number: table.number,
    name: table.name,
    status: table.status,
    seats: table.seats,
    people: order?.guestCount ?? 0,
    items: order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    total: order ? Number(order.total) : 0,
    minutesOpen: order ? Math.max(0, Math.floor((Date.now() - order.openedAt.getTime()) / 60000)) : 0
  };
}

const includeOpenOrder = {
  orders: {
    where: { status: "OPEN" as const },
    take: 1,
    orderBy: { openedAt: "desc" as const },
    select: {
      openedAt: true,
      guestCount: true,
      total: true,
      items: { select: { quantity: true } }
    }
  }
};

export async function listTables(app: FastifyInstance, storeId: string) {
  const tables = await app.prisma.cafeTable.findMany({
    where: { storeId, active: true },
    include: includeOpenOrder,
    orderBy: { number: "asc" }
  });
  return tables.map(mapTable);
}

export async function getTable(app: FastifyInstance, storeId: string, id: string) {
  const table = await app.prisma.cafeTable.findFirst({
    where: { id, storeId, active: true }, include: includeOpenOrder
  });
  if (!table) throw new AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
  return mapTable(table);
}

export async function setTableStatus(app: FastifyInstance, storeId: string, id: string, status: "FREE"|"OPEN"|"PAYMENT"|"BLOCKED") {
  await getTable(app, storeId, id);
  if (status === "FREE") {
    const openOrder = await app.prisma.order.findFirst({ where: { storeId, tableId: id, status: "OPEN" } });
    if (openOrder) throw new AppError("A mesa possui pedido aberto e não pode ser liberada manualmente.", 409, "TABLE_HAS_OPEN_ORDER");
  }
  const table = await app.prisma.cafeTable.update({ where: { id }, data: { status } });
  return { id: table.id, number: table.number, status: table.status };
}
