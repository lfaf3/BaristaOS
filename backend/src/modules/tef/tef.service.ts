import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { getTefProvider } from "./providers/provider-registry.js";
import type { TefProviderResult } from "./providers/tef-provider.js";
import type { StartTefTransactionInput } from "./tef.schemas.js";

const activeStatuses = ["PENDING", "PROCESSING", "AUTHORIZED", "UNKNOWN"] as const;

function cents(value: number) {
  return Math.round(value * 100);
}

function serializeTransaction(transaction: {
  id: string;
  provider: string;
  method: string;
  status: string;
  amount: unknown;
  installments: number | null;
  externalId: string | null;
  nsu: string | null;
  authorizationCode: string | null;
  cardBrand: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  startedAt: Date;
  confirmedAt: Date | null;
}) {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    startedAt: transaction.startedAt.toISOString(),
    confirmedAt: transaction.confirmedAt?.toISOString() ?? null
  };
}

function providerData(result: TefProviderResult) {
  return {
    status: result.status,
    ...(result.externalId !== undefined && { externalId: result.externalId }),
    ...(result.nsu !== undefined && { nsu: result.nsu }),
    ...(result.authorizationCode !== undefined && { authorizationCode: result.authorizationCode }),
    ...(result.cardBrand !== undefined && { cardBrand: result.cardBrand }),
    ...(result.customerReceipt !== undefined && { customerReceipt: result.customerReceipt }),
    ...(result.merchantReceipt !== undefined && { merchantReceipt: result.merchantReceipt }),
    ...(result.errorCode !== undefined && { errorCode: result.errorCode }),
    ...(result.errorMessage !== undefined && { errorMessage: result.errorMessage }),
    ...(result.status === "AUTHORIZED" && { authorizedAt: new Date() })
  };
}

async function responseFor(app: FastifyInstance, transaction: any) {
  let order = null;
  if (transaction.status === "CONFIRMED") {
    const { getTableOrder } = await import("../tables/tables.order.service.js");
    const linkedOrder = await app.prisma.order.findUnique({
      where: { id: transaction.orderId },
      select: { tableId: true }
    });
    if (linkedOrder?.tableId) order = await getTableOrder(app, transaction.storeId, linkedOrder.tableId);
  }
  return { transaction: serializeTransaction(transaction), order };
}

export async function startTefTransaction(
  app: FastifyInstance,
  storeId: string,
  orderId: string,
  input: StartTefTransactionInput
) {
  const existing = await app.prisma.tefTransaction.findUnique({
    where: { storeId_idempotencyKey: { storeId, idempotencyKey: input.idempotencyKey } }
  });

  if (existing) {
    if (existing.orderId !== orderId) {
      throw new AppError("A chave de idempotência já pertence a outra comanda.", 409, "TEF_IDEMPOTENCY_CONFLICT");
    }
    return responseFor(app, existing);
  }

  const order = await app.prisma.order.findFirst({
    where: { id: orderId, storeId },
    select: {
      id: true,
      status: true,
      total: true,
      tableId: true,
      table: { select: { status: true } },
      store: { select: { tefEnabled: true, tefProvider: true } },
      payments: { where: { status: "APPROVED" }, select: { amount: true } }
    }
  });

  if (!order) throw new AppError("Comanda não encontrada.", 404, "ORDER_NOT_FOUND");
  if (!order.store.tefEnabled) throw new AppError("O TEF está desabilitado para esta loja.", 409, "TEF_DISABLED");
  const provider = getTefProvider(order.store.tefProvider);
  if (!order.tableId || !order.table) throw new AppError("A comanda não está vinculada a uma mesa.", 409, "ORDER_WITHOUT_TABLE");
  if (order.status !== "OPEN" || order.table.status !== "PAYMENT") {
    throw new AppError("A comanda precisa estar aguardando pagamento.", 409, "ORDER_NOT_AWAITING_PAYMENT");
  }

  const active = await app.prisma.tefTransaction.findFirst({
    where: { orderId, status: { in: [...activeStatuses] } },
    select: { id: true }
  });
  if (active) {
    throw new AppError("Já existe uma transação TEF em andamento para esta comanda.", 409, "TEF_TRANSACTION_IN_PROGRESS");
  }

  const paid = order.payments.reduce((sum, payment) => sum + cents(Number(payment.amount)), 0);
  const remaining = cents(Number(order.total)) - paid;
  if (cents(input.amount) !== remaining) {
    throw new AppError("Nesta entrega, o pagamento TEF deve quitar exatamente o saldo da conta.", 422, "TEF_AMOUNT_MISMATCH");
  }

  let transaction = await app.prisma.tefTransaction.create({
    data: {
      storeId,
      orderId,
      provider: provider.code,
      method: input.method,
      amount: input.amount,
      installments: input.method === "TEF_CREDIT" ? input.installments ?? 1 : null,
      idempotencyKey: input.idempotencyKey,
      status: "PROCESSING"
    }
  });

  let started: TefProviderResult;
  try {
    started = await provider.startTransaction({
      transactionId: transaction.id,
      orderId,
      amount: input.amount,
      method: input.method,
      ...(input.installments !== undefined && { installments: input.installments })
    });
  } catch {
    transaction = await app.prisma.tefTransaction.update({
      where: { id: transaction.id },
      data: { status: "UNKNOWN", errorCode: "TEF_COMMUNICATION_ERROR", errorMessage: "Não foi possível determinar o resultado da transação." }
    });
    return responseFor(app, transaction);
  }

  transaction = await app.prisma.tefTransaction.update({
    where: { id: transaction.id },
    data: providerData(started)
  });

  if (started.status !== "AUTHORIZED" || !started.externalId) return responseFor(app, transaction);

  let confirmation: TefProviderResult;
  try {
    confirmation = await provider.confirmTransaction(started.externalId);
  } catch {
    confirmation = {
      status: "UNKNOWN",
      externalId: started.externalId,
      errorCode: "TEF_CONFIRMATION_UNKNOWN",
      errorMessage: "A autorização ocorreu, mas a confirmação não pôde ser verificada."
    };
  }

  if (confirmation.status !== "CONFIRMED") {
    transaction = await app.prisma.tefTransaction.update({
      where: { id: transaction.id },
      data: providerData(confirmation)
    });
    return responseFor(app, transaction);
  }

  transaction = await app.prisma.$transaction(async tx => {
    const currentOrder = await tx.order.findFirst({
      where: { id: orderId, storeId, status: "OPEN" },
      select: { id: true, tableId: true, table: { select: { status: true } } }
    });
    if (!currentOrder?.tableId || currentOrder.table?.status !== "PAYMENT") {
      throw new AppError("A comanda foi alterada durante a confirmação do TEF.", 409, "ORDER_CONCURRENT_UPDATE");
    }

    const payment = await tx.payment.create({
      data: {
        orderId,
        method: input.method,
        amount: input.amount,
        status: "APPROVED",
        externalId: confirmation.externalId ?? null,
        nsu: confirmation.nsu ?? null,
        authorizationCode: confirmation.authorizationCode ?? null,
        cardBrand: confirmation.cardBrand ?? null,
        installments: input.method === "TEF_CREDIT" ? input.installments ?? 1 : null,
        approvedAt: new Date()
      }
    });

    const updatedOrder = await tx.order.updateMany({
      where: { id: orderId, storeId, status: "OPEN" },
      data: { status: "PAID", closedAt: new Date() }
    });
    const updatedTable = await tx.cafeTable.updateMany({
      where: { id: currentOrder.tableId, storeId, status: "PAYMENT" },
      data: { status: "READY_TO_CLOSE" }
    });
    if (updatedOrder.count !== 1 || updatedTable.count !== 1) {
      throw new AppError("A venda foi alterada por outro operador.", 409, "TEF_CONCURRENT_UPDATE");
    }

    return tx.tefTransaction.update({
      where: { id: transaction.id },
      data: {
        ...providerData(confirmation),
        status: "CONFIRMED",
        paymentId: payment.id,
        confirmedAt: new Date()
      }
    });
  });

  return responseFor(app, transaction);
}

export async function getTefTransaction(
  app: FastifyInstance,
  storeId: string,
  orderId: string,
  transactionId: string
) {
  const transaction = await app.prisma.tefTransaction.findFirst({
    where: { id: transactionId, storeId, orderId }
  });
  if (!transaction) throw new AppError("Transação TEF não encontrada.", 404, "TEF_TRANSACTION_NOT_FOUND");
  return responseFor(app, transaction);
}
