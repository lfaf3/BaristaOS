import type { PaymentRequest } from "../dtos/payment-request.js";
import type { PaymentResponse } from "../dtos/payment-response.js";
import type { PaymentStatus } from "../dtos/payment-status.js";

export interface PaymentProviderCallbacks {
  onStatusChanged(transactionId: string, status: PaymentStatus): void;
  onMessage(transactionId: string, message: string): void;
  onError(transactionId: string, error: Error): void;
}

/**
 * Contract for Mock, PayGo, SiTef and future adapters.
 * Implementations must normalize responses, keep confirm/cancel idempotent, emit
 * asynchronous device states through callbacks and report communication errors
 * through onError or a rejected promise. The adapter never completes the sale;
 * session timeout and finalization belong exclusively to PaymentService.
 */
export interface PaymentProvider {
  readonly code: string;
  setCallbacks?(callbacks: PaymentProviderCallbacks): void;
  authorize(request: PaymentRequest): Promise<PaymentResponse>;
  cancel(transactionId: string): Promise<PaymentResponse>;
  confirm(transactionId: string): Promise<PaymentResponse>;
  finish(transactionId: string): Promise<PaymentResponse>;
  status(transactionId: string): Promise<PaymentResponse>;
}
