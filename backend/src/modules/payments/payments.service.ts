import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import type { RegisterPaymentInput } from "./payments.schemas.js";

function cents(value: number) {
  return Math.round(value * 100);
}

export async function registerOrderPayments(
  app: FastifyInstance,
  storeId: string,
  orderId: string,
  payments: RegisterPaymentInput[]
) {
  const tableId = await app.prisma.$transaction(async tx => {
    const order = await tx.order.findFirst({
      where: { id: orderId, storeId },
      select: {
        id: true,
        status: true,
        total: true,
        tableId: true,
        table: { select: { status: true } },
        payments: {
          where: { status: "APPROVED" },
          select: { amount: true }
        }
      }
    });

    if (!order) {
      throw new AppError("Comanda não encontrada.", 404, "ORDER_NOT_FOUND");
    }

    if (!order.tableId || !order.table) {
      throw new AppError(
        "A comanda não está vinculada a uma mesa.",
        409,
        "ORDER_WITHOUT_TABLE"
      );
    }

    if (order.status !== "OPEN" || order.table.status !== "PAYMENT") {
      throw new AppError(
        "A comanda precisa estar aguardando pagamento.",
        409,
        "ORDER_NOT_AWAITING_PAYMENT"
      );
    }

    const alreadyPaid = order.payments.reduce(
      (sum, payment) => sum + cents(Number(payment.amount)),
      0
    );
    const total = cents(Number(order.total));
    const remaining = total - alreadyPaid;
    const incoming = payments.reduce(
      (sum, payment) => sum + cents(payment.amount),
      0
    );

    if (remaining <= 0) {
      throw new AppError("A comanda já foi paga.", 409, "ORDER_ALREADY_PAID");
    }

    if (incoming > remaining) {
      throw new AppError(
        "O valor informado é maior que o saldo da conta.",
        422,
        "PAYMENT_EXCEEDS_BALANCE"
      );
    }

    if (incoming < remaining) {
      throw new AppError(
        "O pagamento precisa quitar todo o saldo. Para pagamento misto, informe todas as formas antes de confirmar.",
        422,
        "PAYMENT_BELOW_BALANCE"
      );
    }

    await tx.payment.createMany({
      data: payments.map(payment => ({
        orderId: order.id,
        method: payment.method,
        amount: payment.amount,
        status: "APPROVED" as const,
        approvedAt: new Date()
      }))
    });

    const updatedOrder = await tx.order.updateMany({
      where: { id: order.id, storeId, status: "OPEN" },
      data: { status: "PAID", closedAt: new Date() }
    });

    if (updatedOrder.count === 0) {
      throw new AppError(
        "A comanda foi alterada por outro operador.",
        409,
        "ORDER_CONCURRENT_UPDATE"
      );
    }

    const updatedTable = await tx.cafeTable.updateMany({
      where: { id: order.tableId, storeId, status: "PAYMENT" },
      data: { status: "READY_TO_CLOSE" }
    });

    if (updatedTable.count === 0) {
      throw new AppError(
        "A mesa foi alterada por outro operador.",
        409,
        "TABLE_CONCURRENT_UPDATE"
      );
    }

    return order.tableId;
  });

  const { getTableOrder } = await import("../tables/tables.order.service.js");
  return getTableOrder(app, storeId, tableId);
}
