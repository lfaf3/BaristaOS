CREATE TYPE "InventoryUnit" AS ENUM ('KG', 'G', 'L', 'ML', 'UNIT');
CREATE TYPE "InventoryMovementType" AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT');

CREATE TABLE "inventory_items" (
  "id" UUID NOT NULL,
  "company_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "unit" "InventoryUnit" NOT NULL,
  "current_stock" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "minimum_stock" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "unit_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "supplier" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory_movements" (
  "id" UUID NOT NULL,
  "item_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "InventoryMovementType" NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "previous_stock" DECIMAL(14,3) NOT NULL,
  "resulting_stock" DECIMAL(14,3) NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "inventory_items_company_id_name_key" ON "inventory_items"("company_id", "name");
CREATE INDEX "inventory_items_company_id_active_idx" ON "inventory_items"("company_id", "active");
CREATE INDEX "inventory_items_company_id_category_idx" ON "inventory_items"("company_id", "category");
CREATE INDEX "inventory_movements_item_id_created_at_idx" ON "inventory_movements"("item_id", "created_at");
CREATE INDEX "inventory_movements_user_id_idx" ON "inventory_movements"("user_id");

ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
