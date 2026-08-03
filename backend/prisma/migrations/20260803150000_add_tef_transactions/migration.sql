CREATE TYPE "TefProviderCode" AS ENUM ('SIMULATED', 'PAYGO', 'SITEF');
CREATE TYPE "TefTransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'AUTHORIZED', 'CONFIRMED', 'DECLINED', 'CANCELLED', 'FAILED', 'UNKNOWN');

ALTER TABLE "stores" ADD COLUMN "tef_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "stores" ADD COLUMN "tef_provider" "TefProviderCode" NOT NULL DEFAULT 'SIMULATED';

CREATE TABLE "tef_transactions" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "payment_id" UUID,
    "provider" "TefProviderCode" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "TefTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "installments" INTEGER,
    "idempotency_key" TEXT NOT NULL,
    "external_id" TEXT,
    "nsu" TEXT,
    "authorization_code" TEXT,
    "card_brand" TEXT,
    "customer_receipt" TEXT,
    "merchant_receipt" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorized_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tef_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tef_transactions_payment_id_key" ON "tef_transactions"("payment_id");
CREATE UNIQUE INDEX "tef_transactions_store_id_idempotency_key_key" ON "tef_transactions"("store_id", "idempotency_key");
CREATE INDEX "tef_transactions_order_id_status_idx" ON "tef_transactions"("order_id", "status");
CREATE INDEX "tef_transactions_store_id_status_idx" ON "tef_transactions"("store_id", "status");

ALTER TABLE "tef_transactions" ADD CONSTRAINT "tef_transactions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tef_transactions" ADD CONSTRAINT "tef_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tef_transactions" ADD CONSTRAINT "tef_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
