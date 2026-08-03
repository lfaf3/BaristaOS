import type { PaymentStatus } from "./payment-status.js";

export interface PaymentResponse {
  transactionId: string;
  provider: string;
  status: PaymentStatus;
  providerReference?: string;
  authorizationCode?: string;
  message?: string;
  processedAt: string;
}
