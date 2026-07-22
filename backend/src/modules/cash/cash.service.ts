import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

function serialize(session: { openingAmount: unknown; closingAmount: unknown } & Record<string, unknown>) {
  return {
    ...session,
    openingAmount: Number(session.openingAmount),
    closingAmount: session.closingAmount === null ? null : Number(session.closingAmount)
  };
}

export async function getCurrentCash(app: FastifyInstance, storeId: string) {
  const session = await app.prisma.cashSession.findFirst({
    where: { storeId, status: "OPEN" },
    orderBy: { openedAt: "desc" },
    include: { operator: { select: { id: true, name: true } } }
  });
  return session ? serialize(session) : null;
}

export async function openCash(app: FastifyInstance, storeId: string, operatorId: string, input: { openingAmount: number; note?: string | undefined }) {
  return app.prisma.$transaction(async tx => {
    const existing = await tx.cashSession.findFirst({ where: { storeId, status: "OPEN" } });
    if (existing) throw new AppError("Já existe um caixa aberto nesta loja.", 409, "CASH_ALREADY_OPEN");
    const session = await tx.cashSession.create({
      data: {
        storeId,
        operatorId,
        openingAmount: input.openingAmount,
        openingNote: input.note ?? null
      },
      include: { operator: { select: { id: true, name: true } } }
    });
    return serialize(session);
  });
}

export async function closeCash(app: FastifyInstance, storeId: string, input: { closingAmount: number; note?: string | undefined }) {
  return app.prisma.$transaction(async tx => {
    const session = await tx.cashSession.findFirst({ where: { storeId, status: "OPEN" }, orderBy: { openedAt: "desc" } });
    if (!session) throw new AppError("Não existe caixa aberto nesta loja.", 404, "CASH_NOT_OPEN");
    const openOrders = await tx.order.count({ where: { storeId, cashSessionId: session.id, status: "OPEN" } });
    if (openOrders > 0) throw new AppError("Existem pedidos abertos. Feche-os antes de encerrar o caixa.", 409, "CASH_HAS_OPEN_ORDERS");
    const updated = await tx.cashSession.update({
      where: { id: session.id },
      data: { status: "CLOSED", closingAmount: input.closingAmount, closingNote: input.note ?? null, closedAt: new Date() },
      include: { operator: { select: { id: true, name: true } } }
    });
    return serialize(updated);
  });
}
