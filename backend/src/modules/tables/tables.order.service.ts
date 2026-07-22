import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

export async function getTableOrder(
  app: FastifyInstance,
  storeId: string,
  tableId: string
) {
  const table = await app.prisma.cafeTable.findFirst({
    where: { id: tableId, storeId, active: true },
    select: {
      id: true,
      number: true,
      name: true,
      status: true,
      seats: true,
      openedAt: true
    }
  });

  if (!table) {
    throw new AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
  }

  if (table.status === "FREE" || table.status === "BLOCKED") {
    throw new AppError(
      "A mesa não possui uma comanda disponível.",
      409,
      "TABLE_HAS_NO_ACTIVE_ORDER"
    );
  }

  const order = await app.prisma.order.findFirst({
    where: { storeId, tableId, status: "OPEN" },
    orderBy: { openedAt: "desc" },
    select: {
      id: true,
      guestCount: true,
      subtotal: true,
      discount: true,
      total: true,
      openedAt: true,
      notes: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          notes: true,
          product: {
            select: {
              id: true,
              code: true,
              name: true
            }
          }
        }
      }
    }
  });

  const openedAt = order?.openedAt ?? table.openedAt;

  return {
    table: {
      id: table.id,
      number: table.number,
      name: table.name,
      status: table.status,
      seats: table.seats,
      people: order?.guestCount ?? 0,
      openedAt: openedAt?.toISOString() ?? null,
      minutesOpen: openedAt
        ? Math.max(0, Math.floor((Date.now() - openedAt.getTime()) / 60000))
        : 0
    },
    order: order
      ? {
          id: order.id,
          guestCount: order.guestCount,
          openedAt: order.openedAt.toISOString(),
          notes: order.notes,
          subtotal: Number(order.subtotal),
          discount: Number(order.discount),
          serviceCharge: 0,
          total: Number(order.total)
        }
      : null,
    items:
      order?.items.map(item => ({
        id: item.id,
        productId: item.product.id,
        code: item.product.code,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        notes: item.notes
      })) ?? [],
    subtotal: order ? Number(order.subtotal) : 0,
    discount: order ? Number(order.discount) : 0,
    serviceCharge: 0,
    total: order ? Number(order.total) : 0
  };
}
