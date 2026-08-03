import type { PaymentStatus } from "./dtos/payment-status.js";

export interface PaymentEvent {
  timestamp: string;
  message: string;
  status: PaymentStatus;
}
