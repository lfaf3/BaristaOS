-- BaristaOS v3.3.8.1
-- Migration: add_suppliers

CREATE TABLE "suppliers" (
    "id" UUID PRIMARY KEY,
    "company_id" UUID NOT NULL,
    "corporate_name" TEXT NOT NULL,
    "trade_name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "state_registration" TEXT,
    "municipal_registration" TEXT,
    "contact_name" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "zip_code" TEXT,
    "address" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "district" TEXT,
    "city" TEXT,
    "state" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL
);

ALTER TABLE "suppliers"
ADD CONSTRAINT "suppliers_company_id_fkey"
FOREIGN KEY ("company_id")
REFERENCES "companies"("id")
ON DELETE RESTRICT;

ALTER TABLE "inventory_items"
ADD COLUMN "supplier_id" UUID NULL;

ALTER TABLE "inventory_items"
ADD CONSTRAINT "inventory_items_supplier_id_fkey"
FOREIGN KEY ("supplier_id")
REFERENCES "suppliers"("id")
ON DELETE SET NULL;

CREATE UNIQUE INDEX "suppliers_company_document_key"
ON "suppliers"("company_id","document");

CREATE INDEX "suppliers_company_idx"
ON "suppliers"("company_id");

CREATE INDEX "suppliers_trade_name_idx"
ON "suppliers"("trade_name");

CREATE INDEX "suppliers_corporate_name_idx"
ON "suppliers"("corporate_name");

CREATE INDEX "suppliers_city_idx"
ON "suppliers"("city");
