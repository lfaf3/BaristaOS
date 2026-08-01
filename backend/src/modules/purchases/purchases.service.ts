import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import type {
  CreatePurchaseOrderInput,
  PurchaseOrderListQuery,
  UpdatePurchaseOrderInput
} from "./purchases.schemas.js";

function startOfDay(value: string) {
  return new Date(`${value}T00:00:00.000-03:00`);
}

function endOfDay(value: string) {
  return new Date(`${value}T23:59:59.999-03:00`);
}

function serializeOrder(order: any) {
  return {
    ...order,
    total: Number(order.total),
    items: order.items?.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      inventoryItem: item.inventoryItem
        ? {
            ...item.inventoryItem,
            unitCost: Number(item.inventoryItem.unitCost)
          }
        : undefined
    })) ?? []
  };
}

function calculateItems(items: CreatePurchaseOrderInput["items"]) {
  return items.map(item => ({
    inventoryItemId: item.inventoryItemId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: Number((item.quantity * item.unitPrice).toFixed(2))
  }));
}

async function validateSupplier(
  app: FastifyInstance,
  companyId: string,
  supplierId: string
) {
  const supplier = await app.prisma.supplier.findFirst({
    where: { id: supplierId, companyId, active: true },
    select: { id: true }
  });

  if (!supplier) {
    throw new AppError(
      "Fornecedor ativo não encontrado.",
      404,
      "PURCHASE_SUPPLIER_NOT_FOUND"
    );
  }
}

async function validateInventoryItems(
  app: FastifyInstance,
  companyId: string,
  itemIds: string[]
) {
  if (itemIds.length === 0) return;

  const count = await app.prisma.inventoryItem.count({
    where: {
      companyId,
      active: true,
      id: { in: itemIds }
    }
  });

  if (count !== itemIds.length) {
    throw new AppError(
      "Um ou mais itens de estoque não foram encontrados ou estão inativos.",
      422,
      "PURCHASE_INVENTORY_ITEM_INVALID"
    );
  }
}

function createOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const time = now.toISOString().slice(11, 19).replaceAll(":", "");
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `PC-${date}-${time}-${suffix}`;
}

const orderInclude = {
  supplier: {
    select: {
      id: true,
      corporateName: true,
      tradeName: true,
      document: true
    }
  },
  createdBy: {
    select: { id: true, name: true }
  },
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      inventoryItem: {
        select: {
          id: true,
          name: true,
          category: true,
          unit: true,
          unitCost: true
        }
      }
    }
  }
} as const;

export async function listPurchaseOrders(
  app: FastifyInstance,
  companyId: string,
  query: PurchaseOrderListQuery
) {
  const where: any = { companyId };

  if (query.status) where.status = query.status;
  if (query.supplierId) where.supplierId = query.supplierId;
  if (query.q) {
    where.OR = [
      { number: { contains: query.q, mode: "insensitive" } },
      { supplier: { is: { tradeName: { contains: query.q, mode: "insensitive" } } } },
      { supplier: { is: { corporateName: { contains: query.q, mode: "insensitive" } } } }
    ];
  }
  if (query.dateFrom || query.dateTo) {
    where.orderDate = {
      ...(query.dateFrom ? { gte: startOfDay(query.dateFrom) } : {}),
      ...(query.dateTo ? { lte: endOfDay(query.dateTo) } : {})
    };
  }

  const [orders, totalCount] = await app.prisma.$transaction([
    app.prisma.purchaseOrder.findMany({
      where,
      orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: orderInclude
    }),
    app.prisma.purchaseOrder.count({ where })
  ]);

  return {
    data: orders.map(serializeOrder),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize))
    }
  };
}

export async function getPurchaseOrder(
  app: FastifyInstance,
  companyId: string,
  id: string
) {
  const order = await app.prisma.purchaseOrder.findFirst({
    where: { id, companyId },
    include: orderInclude
  });

  if (!order) {
    throw new AppError(
      "Pedido de compra não encontrado.",
      404,
      "PURCHASE_ORDER_NOT_FOUND"
    );
  }

  return serializeOrder(order);
}

export async function createPurchaseOrder(
  app: FastifyInstance,
  companyId: string,
  userId: string,
  input: CreatePurchaseOrderInput
) {
  await validateSupplier(app, companyId, input.supplierId);
  await validateInventoryItems(
    app,
    companyId,
    input.items.map(item => item.inventoryItemId)
  );

  const items = calculateItems(input.items);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const order = await app.prisma.purchaseOrder.create({
    data: {
      companyId,
      supplierId: input.supplierId,
      createdById: userId,
      number: createOrderNumber(),
      ...(input.orderDate ? { orderDate: input.orderDate } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      total,
      ...(items.length > 0 ? { items: { create: items } } : {})
    },
    include: orderInclude
  });

  return serializeOrder(order);
}

export async function updatePurchaseOrder(
  app: FastifyInstance,
  companyId: string,
  id: string,
  input: UpdatePurchaseOrderInput
) {
  const current = await app.prisma.purchaseOrder.findFirst({
    where: { id, companyId },
    select: { id: true, status: true, supplierId: true }
  });

  if (!current) {
    throw new AppError(
      "Pedido de compra não encontrado.",
      404,
      "PURCHASE_ORDER_NOT_FOUND"
    );
  }

  if (current.status !== "DRAFT") {
    throw new AppError(
      "Somente pedidos em rascunho podem ser alterados.",
      409,
      "PURCHASE_ORDER_NOT_EDITABLE"
    );
  }

  const supplierId = input.supplierId ?? current.supplierId;
  await validateSupplier(app, companyId, supplierId);

  if (input.items) {
    await validateInventoryItems(
      app,
      companyId,
      input.items.map(item => item.inventoryItemId)
    );
  }

  const calculatedItems = input.items ? calculateItems(input.items) : undefined;
  const total = calculatedItems
    ? calculatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    : undefined;

  const order = await app.prisma.$transaction(async tx => {
    if (calculatedItems) {
      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: {
        ...(input.supplierId ? { supplierId: input.supplierId } : {}),
        ...(input.orderDate ? { orderDate: input.orderDate } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(total !== undefined ? { total } : {}),
        ...(calculatedItems && calculatedItems.length > 0
          ? { items: { create: calculatedItems } }
          : {})
      },
      include: orderInclude
    });
  });

  return serializeOrder(order);
}

export async function sendPurchaseOrder(
  app: FastifyInstance,
  companyId: string,
  id: string
) {
  const current = await app.prisma.purchaseOrder.findFirst({
    where: { id, companyId },
    include: { items: { select: { id: true } } }
  });

  if (!current) {
    throw new AppError(
      "Pedido de compra não encontrado.",
      404,
      "PURCHASE_ORDER_NOT_FOUND"
    );
  }

  if (current.status !== "DRAFT") {
    throw new AppError(
      "Somente pedidos em rascunho podem ser enviados.",
      409,
      "PURCHASE_ORDER_NOT_SENDABLE"
    );
  }

  if (current.items.length === 0) {
    throw new AppError(
      "Inclua pelo menos um item antes de enviar o pedido.",
      422,
      "PURCHASE_ORDER_EMPTY"
    );
  }

  const order = await app.prisma.purchaseOrder.update({
    where: { id },
    data: { status: "SENT" },
    include: orderInclude
  });

  return serializeOrder(order);
}

export async function cancelPurchaseOrder(
  app: FastifyInstance,
  companyId: string,
  id: string
) {
  const current = await app.prisma.purchaseOrder.findFirst({
    where: { id, companyId },
    select: { id: true, status: true }
  });

  if (!current) {
    throw new AppError(
      "Pedido de compra não encontrado.",
      404,
      "PURCHASE_ORDER_NOT_FOUND"
    );
  }

  if (!["DRAFT", "SENT"].includes(current.status)) {
    throw new AppError(
      "Este pedido não pode mais ser cancelado.",
      409,
      "PURCHASE_ORDER_NOT_CANCELLABLE"
    );
  }

  const order = await app.prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: orderInclude
  });

  return serializeOrder(order);
}
