import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

type TableWithOpenOrder = {
  id: string;
  number: number;
  name: string | null;
  status: string;
  seats: number;
  openedAt: Date | null;
  orders: Array<{
    openedAt: Date;
    guestCount: number;
    total: unknown;
    items: Array<{ quantity: number }>;
  }>;
};

function mapTable(table: TableWithOpenOrder) {
  const order = table.orders[0];
  const openedAt = order?.openedAt ?? table.openedAt;

  return {
    id: table.id,
    number: table.number,
    name: table.name,
    status: table.status,
    seats: table.seats,
    people: order?.guestCount ?? 0,
    items: order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    total: order ? Number(order.total) : 0,
    minutesOpen: openedAt
      ? Math.max(0, Math.floor((Date.now() - openedAt.getTime()) / 60000))
      : 0
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
    where: { id, storeId, active: true },
    include: includeOpenOrder
  });

  if (!table) {
    throw new AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
  }

  return mapTable(table);
}

export async function openTable(app: FastifyInstance, storeId: string, id: string) {
  const table = await app.prisma.cafeTable.findFirst({
    where: { id, storeId, active: true },
    select: { id: true, status: true }
  });

  if (!table) {
    throw new AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
  }

  if (table.status !== "FREE") {
    throw new AppError(
      "A mesa não está disponível para abertura.",
      409,
      "TABLE_NOT_FREE"
    );
  }

  const updated = await app.prisma.cafeTable.updateMany({
    where: { id, storeId, active: true, status: "FREE" },
    data: { status: "OPEN", openedAt: new Date() }
  });

  if (updated.count === 0) {
    throw new AppError(
      "A mesa foi alterada por outro operador. Atualize o mapa de mesas.",
      409,
      "TABLE_CONCURRENT_UPDATE"
    );
  }

  return getTable(app, storeId, id);
}

export async function setTableStatus(
  app: FastifyInstance,
  storeId: string,
  id: string,
  status: "FREE" | "OPEN" | "PAYMENT" | "BLOCKED"
) {
  await getTable(app, storeId, id);

  if (status === "FREE") {
    const openOrder = await app.prisma.order.findFirst({
      where: { storeId, tableId: id, status: "OPEN" }
    });

    if (openOrder) {
      throw new AppError(
        "A mesa possui pedido aberto e não pode ser liberada manualmente.",
        409,
        "TABLE_HAS_OPEN_ORDER"
      );
    }
  }

  const data: { status: "FREE" | "OPEN" | "PAYMENT" | "BLOCKED"; openedAt?: Date | null } = { status };
  if (status === "FREE") data.openedAt = null;

  await app.prisma.cafeTable.update({
    where: { id },
    data
  });

  return getTable(app, storeId, id);
}
