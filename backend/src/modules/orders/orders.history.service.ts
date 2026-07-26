import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  tableNumber?: number;
  page: number;
  pageSize: number;
}

function startOfDay(value: string) {
  return new Date(`${value}T00:00:00.000-03:00`);
}

function endOfDay(value: string) {
  return new Date(`${value}T23:59:59.999-03:00`);
}

function mapPaymentMethod(method: string) {
  return method;
}

export async function listOrderHistory(
  app: FastifyInstance,
  storeId: string,
  filters: HistoryFilters
) {
  const where = {
    storeId,
    status: "PAID" as const,
    ...(filters.tableNumber
      ? { table: { is: { number: filters.tableNumber } } }
      : {}),
    ...((filters.dateFrom || filters.dateTo)
      ? {
          closedAt: {
            ...(filters.dateFrom ? { gte: startOfDay(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { lte: endOfDay(filters.dateTo) } : {})
          }
        }
      : {})
  };

  const [orders, totalCount] = await app.prisma.$transaction([
    app.prisma.order.findMany({
      where,
      orderBy: [{ closedAt: "desc" }, { openedAt: "desc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        id: true,
        status: true,
        guestCount: true,
        subtotal: true,
        discount: true,
        serviceChargeRate: true,
        serviceCharge: true,
        total: true,
        openedAt: true,
        closedAt: true,
        notes: true,
        table: { select: { id: true, number: true, name: true } },
        operator: { select: { id: true, name: true } },
        items: { select: { quantity: true } },
        payments: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "asc" },
          select: { id: true, method: true, amount: true, approvedAt: true }
        }
      }
    }),
    app.prisma.order.count({ where })
  ]);

  return {
    data: orders.map(order => ({
      id: order.id,
      status: order.status,
      table: order.table,
      operator: order.operator,
      guestCount: order.guestCount,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      serviceChargePercentage: Number(order.serviceChargeRate),
      serviceCharge: Number(order.serviceCharge),
      total: Number(order.total),
      openedAt: order.openedAt.toISOString(),
      closedAt: order.closedAt?.toISOString() ?? null,
      notes: order.notes,
      payments: order.payments.map(payment => ({
        id: payment.id,
        method: mapPaymentMethod(payment.method),
        amount: Number(payment.amount),
        approvedAt: payment.approvedAt?.toISOString() ?? null
      }))
    })),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize))
    }
  };
}

export async function getOrderHistoryDetail(
  app: FastifyInstance,
  storeId: string,
  orderId: string
) {
  const order = await app.prisma.order.findFirst({
    where: { id: orderId, storeId, status: "PAID" },
    select: {
      id: true,
      status: true,
      guestCount: true,
      subtotal: true,
      discount: true,
      serviceChargeRate: true,
      serviceCharge: true,
      total: true,
      openedAt: true,
      closedAt: true,
      notes: true,
      table: { select: { id: true, number: true, name: true } },
      operator: { select: { id: true, name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          notes: true,
          product: { select: { id: true, code: true, name: true } }
        }
      },
      payments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        select: { id: true, method: true, amount: true, approvedAt: true }
      }
    }
  });

  if (!order) {
    throw new AppError("Comanda encerrada não encontrada.", 404, "ORDER_HISTORY_NOT_FOUND");
  }

  return {
    id: order.id,
    status: order.status,
    table: order.table,
    operator: order.operator,
    guestCount: order.guestCount,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    serviceChargePercentage: Number(order.serviceChargeRate),
    serviceCharge: Number(order.serviceCharge),
    total: Number(order.total),
    openedAt: order.openedAt.toISOString(),
    closedAt: order.closedAt?.toISOString() ?? null,
    notes: order.notes,
    items: order.items.map(item => ({
      id: item.id,
      productId: item.product.id,
      code: item.product.code,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      notes: item.notes
    })),
    payments: order.payments.map(payment => ({
      id: payment.id,
      method: mapPaymentMethod(payment.method),
      amount: Number(payment.amount),
      approvedAt: payment.approvedAt?.toISOString() ?? null
    }))
  };
}
