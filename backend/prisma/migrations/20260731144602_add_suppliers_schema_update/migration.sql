/*
  Warnings:

  - You are about to drop the column `supplier` on the `inventory_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_company_id_fkey";

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "primary_color" SET DEFAULT '#3F2C27';

-- AlterTable
ALTER TABLE "inventory_items" DROP COLUMN "supplier";

-- AlterTable
ALTER TABLE "suppliers" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "suppliers_company_document_key" RENAME TO "suppliers_company_id_document_key";

-- RenameIndex
ALTER INDEX "suppliers_company_idx" RENAME TO "suppliers_company_id_idx";
