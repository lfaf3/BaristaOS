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

export async function addTableOrderItem(
  app: FastifyInstance,
  companyId: string,
  storeId: string,
  operatorId: string,
  tableId: string,
  input: { productId: string; quantity: number; notes?: string | undefined }
) {
  await app.prisma.$transaction(async tx => {
    const table = await tx.cafeTable.findFirst({
      where: { id: tableId, storeId, active: true },
      select: { id: true, status: true }
    });

    if (!table) {
      throw new AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
    }

    if (table.status !== "OPEN") {
      throw new AppError(
        "A mesa precisa estar em atendimento para receber produtos.",
        409,
        "TABLE_NOT_OPEN"
      );
    }

    const product = await tx.product.findFirst({
      where: { id: input.productId, companyId, active: true },
      select: { id: true, price: true }
    });

    if (!product) {
      throw new AppError("Produto não encontrado ou inativo.", 404, "PRODUCT_NOT_FOUND");
    }

    const cashSession = await tx.cashSession.findFirst({
      where: { storeId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
      select: { id: true }
    });

    if (!cashSession) {
      throw new AppError(
        "Abra o caixa antes de incluir produtos na comanda.",
        409,
        "CASH_NOT_OPEN"
      );
    }

    let order = await tx.order.findFirst({
      where: { storeId, tableId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
      select: { id: true, discount: true }
    });

    if (!order) {
      order = await tx.order.create({
        data: {
          storeId,
          tableId,
          cashSessionId: cashSession.id,
          operatorId,
          status: "OPEN"
        },
        select: { id: true, discount: true }
      });
    }

    const unitPrice = Number(product.price);
    const normalizedNotes = input.notes?.trim() || null;
    const existingItem = await tx.orderItem.findFirst({
      where: {
        orderId: order.id,
        productId: product.id,
        notes: normalizedNotes
      },
      select: { id: true, quantity: true, unitPrice: true }
    });

    if (existingItem && Number(existingItem.unitPrice) === unitPrice) {
      const quantity = existingItem.quantity + input.quantity;
      await tx.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity, totalPrice: unitPrice * quantity }
      });
    } else {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: input.quantity,
          unitPrice,
          totalPrice: unitPrice * input.quantity,
          notes: normalizedNotes
        }
      });
    }

    const aggregate = await tx.orderItem.aggregate({
      where: { orderId: order.id },
      _sum: { totalPrice: true }
    });

    const subtotal = Number(aggregate._sum.totalPrice ?? 0);
    const discount = Number(order.discount);
    const total = Math.max(0, subtotal - discount);

    await tx.order.update({
      where: { id: order.id },
      data: { subtotal, total }
    });
  });

  return getTableOrder(app, storeId, tableId);
}
