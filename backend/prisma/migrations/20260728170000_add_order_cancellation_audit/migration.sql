-- AlterTable
ALTER TABLE "orders"
ADD COLUMN "cancelled_at" TIMESTAMP(3),
ADD COLUMN "cancelled_by_id" UUID,
ADD COLUMN "cancellation_reason" TEXT;
