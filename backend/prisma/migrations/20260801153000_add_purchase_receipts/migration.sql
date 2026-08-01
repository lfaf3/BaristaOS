-- CreateTable
CREATE TABLE "purchase_receipts" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "received_by_id" UUID NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_receipt_items" (
    "id" UUID NOT NULL,
    "purchase_receipt_id" UUID NOT NULL,
    "purchase_order_item_id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit_cost" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_receipt_items_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "inventory_movements"
ADD COLUMN "purchase_receipt_item_id" UUID;

-- CreateIndex
CREATE INDEX "purchase_receipts_purchase_order_id_received_at_idx"
ON "purchase_receipts"("purchase_order_id", "received_at");

-- CreateIndex
CREATE INDEX "purchase_receipts_received_by_id_idx"
ON "purchase_receipts"("received_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_receipt_items_purchase_receipt_id_purchase_order_item_id_key"
ON "purchase_receipt_items"("purchase_receipt_id", "purchase_order_item_id");

-- CreateIndex
CREATE INDEX "purchase_receipt_items_purchase_receipt_id_idx"
ON "purchase_receipt_items"("purchase_receipt_id");

-- CreateIndex
CREATE INDEX "purchase_receipt_items_purchase_order_item_id_idx"
ON "purchase_receipt_items"("purchase_order_item_id");

-- CreateIndex
CREATE INDEX "purchase_receipt_items_inventory_item_id_idx"
ON "purchase_receipt_items"("inventory_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_movements_purchase_receipt_item_id_key"
ON "inventory_movements"("purchase_receipt_item_id");

-- AddForeignKey
ALTER TABLE "purchase_receipts"
ADD CONSTRAINT "purchase_receipts_purchase_order_id_fkey"
FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_receipts"
ADD CONSTRAINT "purchase_receipts_received_by_id_fkey"
FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_receipt_items"
ADD CONSTRAINT "purchase_receipt_items_purchase_receipt_id_fkey"
FOREIGN KEY ("purchase_receipt_id") REFERENCES "purchase_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_receipt_items"
ADD CONSTRAINT "purchase_receipt_items_purchase_order_item_id_fkey"
FOREIGN KEY ("purchase_order_item_id") REFERENCES "purchase_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_receipt_items"
ADD CONSTRAINT "purchase_receipt_items_inventory_item_id_fkey"
FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements"
ADD CONSTRAINT "inventory_movements_purchase_receipt_item_id_fkey"
FOREIGN KEY ("purchase_receipt_item_id") REFERENCES "purchase_receipt_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
