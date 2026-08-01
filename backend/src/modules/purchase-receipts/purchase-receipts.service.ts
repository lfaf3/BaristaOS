import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import type { CreatePurchaseReceiptInput } from "./purchase-receipts.schemas.js";

const EPSILON = 0.0005;

function serializeReceipt(receipt: any) {
  return {
    ...receipt,
    items:
      receipt.items?.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        subtotal: Number(item.subtotal),
        inventoryItem: item.inventoryItem
          ? {
              ...item.inventoryItem,
              currentStock: Number(item.inventoryItem.currentStock),
              minimumStock: Number(item.inventoryItem.minimumStock),
              unitCost: Number(item.inventoryItem.unitCost)
            }
          : undefined,
        purchaseOrderItem: item.purchaseOrderItem
          ? {
              ...item.purchaseOrderItem,
              quantity: Number(item.purchaseOrderItem.quantity),
              unitPrice: Number(item.purchaseOrderItem.unitPrice),
              subtotal: Number(item.purchaseOrderItem.subtotal)
            }
          : undefined,
        movement: item.movement
          ? {
              ...item.movement,
              quantity: Number(item.movement.quantity),
              previousStock: Number(item.movement.previousStock),
              resultingStock: Number(item.movement.resultingStock)
            }
          : undefined
      })) ?? []
  };
}

const receiptInclude = {
  receivedBy: {
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
          currentStock: true,
          minimumStock: true,
          unitCost: true
        }
      },
      purchaseOrderItem: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          subtotal: true
        }
      },
      movement: true
    }
  }
} as const;

export async function listPurchaseReceipts(
  app: FastifyInstance,
  companyId: string,
  purchaseOrderId: string
) {
  const order = await app.prisma.purchaseOrder.findFirst({
    where: { id: purchaseOrderId, companyId },
    select: { id: true }
  });

  if (!order) {
    throw new AppError(
      "Pedido de compra não encontrado.",
      404,
      "PURCHASE_ORDER_NOT_FOUND"
    );
  }

  const receipts = await app.prisma.purchaseReceipt.findMany({
    where: { purchaseOrderId },
    include: receiptInclude,
    orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }]
  });

  return { data: receipts.map(serializeReceipt) };
}

export async function createPurchaseReceipt(
  app: FastifyInstance,
  companyId: string,
  userId: string,
  purchaseOrderId: string,
  input: CreatePurchaseReceiptInput
) {
  return app.prisma.$transaction(async tx => {
    const order = await tx.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId },
      include: {
        items: {
          include: {
            inventoryItem: true,
            receiptItems: {
              select: { quantity: true }
            }
          }
        }
      }
    });

    if (!order) {
      throw new AppError(
        "Pedido de compra não encontrado.",
        404,
        "PURCHASE_ORDER_NOT_FOUND"
      );
    }

    if (order.status !== "SENT" && order.status !== "PARTIALLY_RECEIVED") {
      throw new AppError(
        "Somente pedidos enviados ou parcialmente recebidos podem receber mercadorias.",
        409,
        "PURCHASE_ORDER_NOT_RECEIVABLE"
      );
    }

    const orderItemsById = new Map(order.items.map(item => [item.id, item]));
    const receivedInThisOperation = new Map<string, number>();

    const validatedItems = input.items.map(inputItem => {
      const orderItem = orderItemsById.get(inputItem.purchaseOrderItemId);

      if (!orderItem) {
        throw new AppError(
          "Um ou mais itens não pertencem ao pedido de compra informado.",
          422,
          "PURCHASE_RECEIPT_ITEM_INVALID"
        );
      }

      if (!orderItem.inventoryItem.active) {
        throw new AppError(
          "Não é possível receber um item de estoque inativo.",
          422,
          "PURCHASE_RECEIPT_INVENTORY_ITEM_INACTIVE"
        );
      }

      const orderedQuantity = Number(orderItem.quantity);
      const previouslyReceived = orderItem.receiptItems.reduce(
        (sum, receiptItem) => sum + Number(receiptItem.quantity),
        0
      );
      const remainingQuantity = Math.max(
        0,
        orderedQuantity - previouslyReceived
      );

      if (inputItem.quantity - remainingQuantity > EPSILON) {
        throw new AppError(
          `A quantidade recebida é maior que o saldo pendente do item (${remainingQuantity}).`,
          422,
          "PURCHASE_RECEIPT_QUANTITY_EXCEEDED"
        );
      }

      const unitCost = inputItem.unitCost ?? Number(orderItem.unitPrice);
      const subtotal = Number((inputItem.quantity * unitCost).toFixed(2));

      receivedInThisOperation.set(orderItem.id, inputItem.quantity);

      return {
        orderItem,
        quantity: inputItem.quantity,
        unitCost,
        subtotal
      };
    });

    const receipt = await tx.purchaseReceipt.create({
      data: {
        purchaseOrderId,
        receivedById: userId,
        ...(input.receivedAt ? { receivedAt: input.receivedAt } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {})
      }
    });

    for (const receivedItem of validatedItems) {
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          id: receivedItem.orderItem.inventoryItemId,
          companyId
        }
      });

      if (!inventoryItem) {
        throw new AppError(
          "Item de estoque não encontrado.",
          404,
          "INVENTORY_ITEM_NOT_FOUND"
        );
      }

      const previousStock = Number(inventoryItem.currentStock);
      const previousUnitCost = Number(inventoryItem.unitCost);
      const resultingStock = Number(
        (previousStock + receivedItem.quantity).toFixed(3)
      );

      const totalPreviousValue = previousStock * previousUnitCost;
      const receivedValue = receivedItem.quantity * receivedItem.unitCost;
      const averageUnitCost =
        resultingStock > EPSILON
          ? Number(
              ((totalPreviousValue + receivedValue) / resultingStock).toFixed(2)
            )
          : receivedItem.unitCost;

      const receiptItem = await tx.purchaseReceiptItem.create({
        data: {
          purchaseReceiptId: receipt.id,
          purchaseOrderItemId: receivedItem.orderItem.id,
          inventoryItemId: inventoryItem.id,
          quantity: receivedItem.quantity,
          unitCost: receivedItem.unitCost,
          subtotal: receivedItem.subtotal
        }
      });

      await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          currentStock: resultingStock,
          unitCost: averageUnitCost
        }
      });

      await tx.inventoryMovement.create({
        data: {
          itemId: inventoryItem.id,
          userId,
          type: "ENTRY",
          quantity: receivedItem.quantity,
          previousStock,
          resultingStock,
          note: `Recebimento do pedido de compra ${order.number}`,
          purchaseReceiptItemId: receiptItem.id
        }
      });
    }

    const fullyReceived = order.items.every(orderItem => {
      const orderedQuantity = Number(orderItem.quantity);
      const previouslyReceived = orderItem.receiptItems.reduce(
        (sum, receiptItem) => sum + Number(receiptItem.quantity),
        0
      );
      const newlyReceived = receivedInThisOperation.get(orderItem.id) ?? 0;

      return (
        orderedQuantity - (previouslyReceived + newlyReceived) <= EPSILON
      );
    });

    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        status: fullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED"
      }
    });

    const completedReceipt = await tx.purchaseReceipt.findUniqueOrThrow({
      where: { id: receipt.id },
      include: receiptInclude
    });

    return serializeReceipt(completedReceipt);
  });
}
