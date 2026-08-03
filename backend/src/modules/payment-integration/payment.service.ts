import { AppError } from "../../shared/errors/app-error.js";
import type { PaymentRequest } from "./dtos/payment-request.js";
import type { PaymentResponse } from "./dtos/payment-response.js";
import { PaymentStatus } from "./dtos/payment-status.js";
import type { PaymentEvent } from "./payment-event.js";
import type { PaymentSession } from "./payment-session.js";
import type { PaymentTransaction } from "./payment-transaction.js";
import type { PaymentProvider, PaymentProviderCallbacks } from "./providers/payment-provider.js";
import { DEFAULT_PAYMENT_SETTINGS, type PaymentSettings } from "./payment-settings.js";
import { transactionLogFromSession, type PaymentTransactionLog } from "./payment-transaction-log.js";

type StatusListener = (response: PaymentResponse) => void;
type ObservablePaymentProvider = PaymentProvider & { setStatusListener(listener: StatusListener): void };

export class PaymentService {
  private readonly providers = new Map<string, PaymentProvider>();
  private readonly transactions = new Map<string, PaymentTransaction>();
  private readonly sessions = new Map<string, PaymentSession>();
  private readonly sessionByTransaction = new Map<string, string>();
  private readonly transactionLogs: PaymentTransactionLog[] = [];
  private sessionSequence = 0;

  constructor(providers: PaymentProvider[], private settings: PaymentSettings = DEFAULT_PAYMENT_SETTINGS) {
    for (const provider of providers) {
      this.providers.set(provider.code, provider);
      provider.setCallbacks?.(this.providerCallbacks());
      if ("setStatusListener" in provider) {
        (provider as ObservablePaymentProvider).setStatusListener(response => {
          const current = this.transactions.get(response.transactionId);
          if (current?.status !== response.status) this.updateStatus(response.transactionId, response.status, response);
        });
      }
    }
  }

  authorize(request: PaymentRequest) { return this.provider().authorize(request); }

  async startPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.provider();
    const now = new Date().toISOString();
    this.transactions.set(request.transactionId, {
      id: request.transactionId, provider: provider.code, status: PaymentStatus.CREATED,
      createdAt: now, updatedAt: now, transactionId: request.transactionId, amount: request.amount,
      events: [{ timestamp: now, status: PaymentStatus.CREATED, message: "Transação criada." }]
    });
    this.createSession(request.transactionId, request.transactionId, request.amount, provider.code);
    return this.withTimeout(request.transactionId, this.authorize(request));
  }

  createSession(saleId: string, transactionId: string, amount: number, provider = this.provider().code): PaymentSession {
    const timestamp = new Date().toISOString();
    const event: PaymentEvent = { timestamp, status: PaymentStatus.CREATED, message: "Sessão iniciada." };
    const sessionId = `${provider}-SESSION-${String(++this.sessionSequence).padStart(5, "0")}`;
    const session: PaymentSession = { sessionId, saleId, provider, status: PaymentStatus.CREATED, amount, timeoutSeconds: this.settings.timeout, startedAt: timestamp, lastEvent: event, events: [event] };
    this.sessions.set(sessionId, session);
    this.sessionByTransaction.set(transactionId, sessionId);
    return session;
  }

  appendEvent(sessionId: string, status: PaymentStatus, message: string): PaymentSession {
    const current = this.requireSession(sessionId);
    if (current.lastEvent.status === status && current.lastEvent.message === message) return current;
    const event: PaymentEvent = { timestamp: new Date().toISOString(), status, message };
    const updated = { ...current, status, lastEvent: event, events: [...current.events, event] };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  closeSession(sessionId: string): PaymentSession {
    const session = this.appendEvent(sessionId, PaymentStatus.FINISHED, "Venda concluída.");
    const closed = { ...session, finishedAt: new Date().toISOString() };
    this.sessions.set(sessionId, closed);
    this.writeTransactionLog(closed);
    return closed;
  }

  cancelSession(sessionId: string, message = "Sessão cancelada."): PaymentSession {
    const session = this.appendEvent(sessionId, PaymentStatus.CANCELLED, message);
    const cancelled = { ...session, finishedAt: new Date().toISOString() };
    this.sessions.set(sessionId, cancelled);
    this.writeTransactionLog(cancelled);
    return cancelled;
  }

  getSession(sessionId: string) { return this.sessions.get(sessionId); }
  getSettings() { return { ...this.settings }; }
  updateSettings(settings: PaymentSettings) { this.settings = { ...settings }; return this.getSettings(); }
  getTransactionLogs() { return [...this.transactionLogs]; }

  updateStatus(transactionId: string, status: PaymentStatus, response?: Pick<PaymentResponse, "authorizationCode" | "message" | "provider">): PaymentTransaction {
    const current = this.requireTransaction(transactionId);
    if ([PaymentStatus.FINISHED, PaymentStatus.CANCELLED, PaymentStatus.FAILED, PaymentStatus.TIMEOUT, PaymentStatus.COMMUNICATION_ERROR].includes(current.status)) return current;
    const timestamp = new Date().toISOString();
    const updated: PaymentTransaction = {
      ...current, provider: response?.provider ?? current.provider, status, updatedAt: timestamp,
      ...(response?.authorizationCode && { authorizationCode: response.authorizationCode }),
      events: [...current.events, { timestamp, status, ...(response?.message && { message: response.message }) }]
    };
    this.transactions.set(transactionId, updated);
    const sessionId = this.sessionByTransaction.get(transactionId);
    if (sessionId) {
      if (status === PaymentStatus.FINISHED) this.closeSession(sessionId);
      else if ([PaymentStatus.CANCELLED, PaymentStatus.FAILED, PaymentStatus.TIMEOUT, PaymentStatus.COMMUNICATION_ERROR].includes(status)) this.cancelSession(sessionId, response?.message ?? "Sessão encerrada com falha.");
      else this.appendEvent(sessionId, status, response?.message ?? status);
    }
    return updated;
  }

  getTransaction(transactionId: string) { return this.transactions.get(transactionId); }

  async finishTransaction(transactionId: string): Promise<PaymentTransaction> {
    const current = this.requireTransaction(transactionId);
    if (current.status !== PaymentStatus.CONFIRMED) throw new AppError("Somente pagamentos confirmados podem ser finalizados.", 409, "PAYMENT_NOT_CONFIRMED");
    await this.provider().finish(transactionId);
    return this.requireTransaction(transactionId);
  }

  cancel(transactionId: string) { return this.provider().cancel(transactionId); }
  confirm(transactionId: string) { return this.provider().confirm(transactionId); }
  status(transactionId: string) { return this.provider().status(transactionId); }

  private requireTransaction(transactionId: string) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new AppError("Transação de pagamento não encontrada.", 404, "PAYMENT_TRANSACTION_NOT_FOUND");
    return transaction;
  }

  private requireSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new AppError("Sessão de pagamento não encontrada.", 404, "PAYMENT_SESSION_NOT_FOUND");
    return session;
  }

  private providerCallbacks(): PaymentProviderCallbacks {
    return {
      onStatusChanged: () => undefined,
      onMessage: () => undefined,
      onError: (transactionId, error) => {
        if (this.transactions.has(transactionId)) {
          const current = this.requireTransaction(transactionId);
          this.updateStatus(transactionId, PaymentStatus.COMMUNICATION_ERROR, { provider: current.provider, message: error.message });
        }
      }
    };
  }

  private provider() {
    const provider = this.providers.get(this.settings.provider);
    if (!provider) throw new AppError(`O provedor de pagamento ${this.settings.provider} não está disponível nesta versão.`, 503, "PAYMENT_PROVIDER_NOT_AVAILABLE");
    return provider;
  }

  private async withTimeout(transactionId: string, operation: Promise<PaymentResponse>): Promise<PaymentResponse> {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<PaymentResponse>(resolve => {
      timeoutHandle = setTimeout(() => {
        const current = this.requireTransaction(transactionId);
        const response: PaymentResponse = {
          transactionId, provider: current.provider, status: PaymentStatus.TIMEOUT,
          message: `Tempo limite de ${this.settings.timeout} segundos excedido.`, processedAt: new Date().toISOString()
        };
        this.updateStatus(transactionId, PaymentStatus.TIMEOUT, response);
        resolve(response);
      }, this.settings.timeout * 1000);
    });
    try { return await Promise.race([operation, timeout]); }
    finally { if (timeoutHandle) clearTimeout(timeoutHandle); }
  }

  private writeTransactionLog(session: PaymentSession) {
    if (!this.settings.logTransactions || this.transactionLogs.some(log => log.sessionId === session.sessionId)) return;
    const log = transactionLogFromSession(session);
    this.transactionLogs.push(log);
    console.info("[PaymentTransaction]", log);
  }
}
