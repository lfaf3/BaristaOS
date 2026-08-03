import type { PaymentStatus } from "./dtos/payment-status.js";

export interface PaymentTransactionEvent {
  timestamp: string;
  status: PaymentStatus;
  message?: string;
}

export interface PaymentTransaction {
  id: string;
  provider: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  authorizationCode?: string;
  transactionId: string;
  amount: number;
  events: PaymentTransactionEvent[];
}
