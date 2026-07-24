import type { FastifyInstance } from "fastify";
import type { Prisma } from "../../generated/prisma/client.js";
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
      serviceChargeRate: true,
      serviceCharge: true,
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
          serviceChargePercentage: Number(order.serviceChargeRate),
          serviceCharge: Number(order.serviceCharge),
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
    serviceChargePercentage: order ? Number(order.serviceChargeRate) : 0,
    serviceCharge: order ? Number(order.serviceCharge) : 0,
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


async function recalculateOrderTotals(
  tx: Prisma.TransactionClient,
  orderId: string,
  discount: number
) {
  const aggregate = await tx.orderItem.aggregate({
    where: { orderId },
    _sum: { totalPrice: true }
  });

  const subtotal = Number(aggregate._sum.totalPrice ?? 0);
  const total = Math.max(0, subtotal - discount);

  await tx.order.update({
    where: { id: orderId },
    data: { subtotal, total }
  });
}

export async function updateTableOrderItem(
  app: FastifyInstance,
  storeId: string,
  tableId: string,
  itemId: string,
  input: { quantity?: number | undefined; notes?: string | null | undefined }
) {
  await app.prisma.$transaction(async tx => {
    const item = await tx.orderItem.findFirst({
      where: {
        id: itemId,
        order: { tableId, storeId, status: "OPEN", table: { status: "OPEN" } }
      },
      select: {
        id: true,
        orderId: true,
        unitPrice: true,
        order: { select: { discount: true } }
      }
    });

    if (!item) {
      throw new AppError(
        "Item não encontrado na comanda aberta desta mesa.",
        404,
        "ORDER_ITEM_NOT_FOUND"
      );
    }

    const data: { quantity?: number; totalPrice?: number; notes?: string | null } = {};

    if (input.quantity !== undefined) {
      data.quantity = input.quantity;
      data.totalPrice = Number(item.unitPrice) * input.quantity;
    }

    if (input.notes !== undefined) {
      data.notes = input.notes?.trim() || null;
    }

    await tx.orderItem.update({ where: { id: item.id }, data });
    await recalculateOrderTotals(tx, item.orderId, Number(item.order.discount));
  });

  return getTableOrder(app, storeId, tableId);
}

export async function deleteTableOrderItem(
  app: FastifyInstance,
  storeId: string,
  tableId: string,
  itemId: string
) {
  await app.prisma.$transaction(async tx => {
    const item = await tx.orderItem.findFirst({
      where: {
        id: itemId,
        order: { tableId, storeId, status: "OPEN", table: { status: "OPEN" } }
      },
      select: {
        id: true,
        orderId: true,
        order: { select: { discount: true } }
      }
    });

    if (!item) {
      throw new AppError(
        "Item não encontrado na comanda aberta desta mesa.",
        404,
        "ORDER_ITEM_NOT_FOUND"
      );
    }

    await tx.orderItem.delete({ where: { id: item.id } });
    await recalculateOrderTotals(tx, item.orderId, Number(item.order.discount));
  });

  return getTableOrder(app, storeId, tableId);
}


function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function closeTableOrder(
  app: FastifyInstance,
  storeId: string,
  tableId: string,
  input: { discount: number; serviceChargePercentage: number }
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
        "A mesa precisa estar em atendimento para fechar a conta.",
        409,
        "TABLE_NOT_OPEN"
      );
    }

    const order = await tx.order.findFirst({
      where: { storeId, tableId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
      select: { id: true }
    });

    if (!order) {
      throw new AppError(
        "A mesa não possui uma comanda aberta.",
        409,
        "ORDER_NOT_FOUND"
      );
    }

    const aggregate = await tx.orderItem.aggregate({
      where: { orderId: order.id },
      _sum: { totalPrice: true },
      _count: { id: true }
    });

    if (aggregate._count.id === 0) {
      throw new AppError(
        "Adicione ao menos um item antes de fechar a conta.",
        409,
        "ORDER_HAS_NO_ITEMS"
      );
    }

    const subtotal = roundCurrency(Number(aggregate._sum.totalPrice ?? 0));
    const serviceCharge = roundCurrency(
      subtotal * (input.serviceChargePercentage / 100)
    );
    const maximumDiscount = roundCurrency(subtotal + serviceCharge);

    if (input.discount > maximumDiscount) {
      throw new AppError(
        "O desconto não pode ser maior que o valor da conta.",
        422,
        "INVALID_DISCOUNT"
      );
    }

    const discount = roundCurrency(input.discount);
    const total = roundCurrency(Math.max(0, subtotal + serviceCharge - discount));

    const updatedTable = await tx.cafeTable.updateMany({
      where: { id: tableId, storeId, active: true, status: "OPEN" },
      data: { status: "PAYMENT" }
    });

    if (updatedTable.count === 0) {
      throw new AppError(
        "A mesa foi alterada por outro operador. Atualize a comanda.",
        409,
        "TABLE_CONCURRENT_UPDATE"
      );
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        subtotal,
        discount,
        serviceChargeRate: input.serviceChargePercentage,
        serviceCharge,
        total
      }
    });
  });

  return getTableOrder(app, storeId, tableId);
}
