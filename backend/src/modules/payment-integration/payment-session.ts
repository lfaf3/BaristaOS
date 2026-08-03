import type { PaymentStatus } from "./dtos/payment-status.js";
import type { PaymentEvent } from "./payment-event.js";

export interface PaymentSession {
  sessionId: string;
  saleId: string;
  provider: string;
  status: PaymentStatus;
  amount: number;
  timeoutSeconds: number;
  startedAt: string;
  finishedAt?: string;
  lastEvent: PaymentEvent;
  events: PaymentEvent[];
}
