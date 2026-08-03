export type TefPaymentMethod = "TEF_CREDIT" | "TEF_DEBIT";
export type TefProviderCode = "SIMULATED" | "PAYGO" | "SITEF";
export type TefProviderStatus = "AUTHORIZED" | "CONFIRMED" | "DECLINED" | "FAILED" | "UNKNOWN";

export interface TefTransactionInput {
  transactionId: string;
  orderId: string;
  amount: number;
  method: TefPaymentMethod;
  installments?: number;
}

export interface TefProviderResult {
  status: TefProviderStatus;
  externalId?: string;
  nsu?: string;
  authorizationCode?: string;
  cardBrand?: string;
  customerReceipt?: string;
  merchantReceipt?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface TefProvider {
  readonly code: TefProviderCode;
  startTransaction(input: TefTransactionInput): Promise<TefProviderResult>;
  getTransactionStatus(reference: string): Promise<TefProviderResult>;
  confirmTransaction(reference: string): Promise<TefProviderResult>;
  cancelTransaction(reference: string): Promise<TefProviderResult>;
}
