import type { PaymentStatus } from "./dtos/payment-status.js";
import type { PaymentSession } from "./payment-session.js";

export interface PaymentTransactionLog {
  date: string; time: string; sessionId: string; provider: string;
  amount: number; status: PaymentStatus; durationMs: number;
}

export function transactionLogFromSession(session: PaymentSession): PaymentTransactionLog {
  const startedAt = new Date(session.startedAt);
  const finishedAt = new Date(session.finishedAt ?? new Date().toISOString());
  return {
    date: finishedAt.toLocaleDateString("pt-BR"), time: finishedAt.toLocaleTimeString("pt-BR"),
    sessionId: session.sessionId, provider: session.provider, amount: session.amount, status: session.status,
    durationMs: Math.max(0, finishedAt.getTime() - startedAt.getTime())
  };
}
