export interface PaymentRequest {
  transactionId: string;
  orderId: string;
  amount: number;
  method: string;
  installments?: number;
  metadata?: Record<string, string>;
}
