import type { PaymentRequest } from "../dtos/payment-request.js";
import type { PaymentResponse } from "../dtos/payment-response.js";
import { PaymentStatus } from "../dtos/payment-status.js";
import type { PaymentProvider, PaymentProviderCallbacks } from "./payment-provider.js";

const MIN_STATE_DELAY_MS = 300;
const MAX_STATE_DELAY_MS = 800;

export interface MockPaymentProviderOptions {
  stateDelayMs?: number;
  shouldFail?: boolean;
  failureMessage?: string;
}

type StatusListener = (response: PaymentResponse) => void;

function wait(milliseconds: number) {
  return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

export class MockPaymentProvider implements PaymentProvider {
  readonly code = "MOCK";
  private readonly transactions = new Map<string, PaymentResponse>();
  private statusListener: StatusListener = () => undefined;
  private callbacks: PaymentProviderCallbacks | undefined;

  constructor(private readonly options: MockPaymentProviderOptions = {}) {}

  setStatusListener(listener: StatusListener) {
    this.statusListener = listener;
  }

  setCallbacks(callbacks: PaymentProviderCallbacks) {
    this.callbacks = callbacks;
  }

  async authorize(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = request.transactionId;
    this.emit(this.response(transactionId, PaymentStatus.CREATED, "Transação criada."));
    await this.transition(transactionId, PaymentStatus.WAITING_DEVICE, "Aguardando PinPad...");
    await this.transition(transactionId, PaymentStatus.CARD_INSERTED, "Cartão inserido.");
    await this.transition(transactionId, PaymentStatus.PROCESSING, "Processando pagamento...");

    const current = this.transactions.get(transactionId);
    if (current?.status === PaymentStatus.CANCELLED) return current;

    if (this.options.shouldFail) {
      this.callbacks?.onError(transactionId, new Error(this.options.failureMessage ?? "Pagamento não autorizado pelo provedor mock."));
      return this.emit(this.response(
        transactionId,
        PaymentStatus.FAILED,
        this.options.failureMessage ?? "Pagamento não autorizado pelo provedor mock."
      ));
    }

    await wait(this.stateDelayMs());
    return this.emit(this.response(transactionId, PaymentStatus.AUTHORIZED, "Pagamento autorizado.", {
      providerReference: transactionId,
      authorizationCode: "123456"
    }));
  }

  async cancel(transactionId: string): Promise<PaymentResponse> {
    return this.emit(this.response(transactionId, PaymentStatus.CANCELLED, "Pagamento cancelado."));
  }

  async confirm(transactionId: string): Promise<PaymentResponse> {
    const current = this.transactions.get(transactionId);
    if (current?.status !== PaymentStatus.AUTHORIZED) {
      return this.emit(this.response(transactionId, PaymentStatus.FAILED, "Somente pagamentos autorizados podem ser confirmados."));
    }
    await wait(this.stateDelayMs());
    return this.emit(this.response(transactionId, PaymentStatus.CONFIRMED, "Pagamento confirmado.", {
      ...(current.providerReference && { providerReference: current.providerReference }),
      ...(current.authorizationCode && { authorizationCode: current.authorizationCode })
    }));
  }

  async finish(transactionId: string): Promise<PaymentResponse> {
    const current = this.transactions.get(transactionId);
    if (current?.status !== PaymentStatus.CONFIRMED) {
      return this.emit(this.response(transactionId, PaymentStatus.FAILED, "Somente pagamentos confirmados podem ser finalizados."));
    }
    await wait(this.stateDelayMs());
    return this.emit(this.response(transactionId, PaymentStatus.FINISHED, "Transação finalizada.", {
      ...(current.providerReference && { providerReference: current.providerReference }),
      ...(current.authorizationCode && { authorizationCode: current.authorizationCode })
    }));
  }

  async status(transactionId: string): Promise<PaymentResponse> {
    return this.transactions.get(transactionId) ?? this.response(transactionId, PaymentStatus.FAILED, "Pagamento não encontrado.");
  }

  private async transition(transactionId: string, status: PaymentStatus, message: string) {
    await wait(this.stateDelayMs());
    return this.emit(this.response(transactionId, status, message));
  }

  private emit(response: PaymentResponse): PaymentResponse {
    this.transactions.set(response.transactionId, response);
    this.statusListener(response);
    this.callbacks?.onStatusChanged(response.transactionId, response.status);
    if (response.message) this.callbacks?.onMessage(response.transactionId, response.message);
    return response;
  }

  private response(transactionId: string, status: PaymentStatus, message: string, details: Partial<PaymentResponse> = {}): PaymentResponse {
    return { transactionId, provider: this.code, status, message, processedAt: new Date().toISOString(), ...details };
  }

  private stateDelayMs(): number {
    if (this.options.stateDelayMs !== undefined) return this.options.stateDelayMs;
    return Math.floor(Math.random() * (MAX_STATE_DELAY_MS - MIN_STATE_DELAY_MS + 1)) + MIN_STATE_DELAY_MS;
  }
}
