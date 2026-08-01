import { apiRequest } from "./http-client";
import type { InventoryUnit } from "./inventory.service";

export interface PurchaseReceiptUser {
  id: string;
  name: string;
}

export interface PurchaseReceiptInventoryItem {
  id: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
}

export interface PurchaseReceiptOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseReceiptMovement {
  id: string;
  itemId: string;
  userId: string;
  type: "ENTRY";
  quantity: number;
  previousStock: number;
  resultingStock: number;
  note: string | null;
  createdAt: string;
}

export interface PurchaseReceiptItem {
  id: string;
  purchaseReceiptId: string;
  purchaseOrderItemId: string;
  inventoryItemId: string;
  movementId: string | null;
  quantity: number;
  unitCost: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  inventoryItem: PurchaseReceiptInventoryItem;
  purchaseOrderItem: PurchaseReceiptOrderItem;
  movement?: PurchaseReceiptMovement | null;
}

export interface PurchaseReceipt {
  id: string;
  purchaseOrderId: string;
  receivedById: string;
  receivedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  receivedBy: PurchaseReceiptUser;
  items: PurchaseReceiptItem[];
}

export interface PurchaseReceiptItemInput {
  purchaseOrderItemId: string;
  quantity: number;
  unitCost?: number;
}

export interface CreatePurchaseReceiptInput {
  receivedAt?: string;
  notes?: string | null;
  items: PurchaseReceiptItemInput[];
}

export interface PurchaseReceiptListResponse {
  data: PurchaseReceipt[];
}

export const purchaseReceiptsService = {
  list(purchaseOrderId: string) {
    return apiRequest<PurchaseReceiptListResponse>({
      method: "GET",
      url: `/purchases/${purchaseOrderId}/receipts`,
    });
  },

  create(purchaseOrderId: string, data: CreatePurchaseReceiptInput) {
    return apiRequest<PurchaseReceipt>({
      method: "POST",
      url: `/purchases/${purchaseOrderId}/receipts`,
      data,
    });
  },
};
