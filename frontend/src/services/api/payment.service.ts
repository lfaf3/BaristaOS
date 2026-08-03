export type PaymentStatus = "CREATED" | "WAITING_DEVICE" | "CARD_INSERTED" | "PROCESSING" | "AUTHORIZED" | "CONFIRMED" | "FINISHED" | "CANCELLED" | "FAILED" | "TIMEOUT" | "COMMUNICATION_ERROR";
export type PaymentProviderCode = "MOCK" | "SITEF" | "PAYGO";
export type PaymentTimeoutSeconds = 30 | 60 | 120;
export interface PaymentSettings { provider: PaymentProviderCode; timeout: PaymentTimeoutSeconds; retryAttempts: number; autoConfirm: boolean; logTransactions: boolean; }
export interface PaymentRequest { amount: number; method: string; }
export interface PaymentEvent { timestamp: string; status: PaymentStatus; message: string; }
export interface PaymentSession { sessionId: string; saleId: string; provider: string; status: PaymentStatus; amount: number; timeoutSeconds: PaymentTimeoutSeconds; startedAt: string; finishedAt: string | null; lastEvent: PaymentEvent; events: PaymentEvent[]; }
export interface PaymentResponse { transactionId: string; provider: string; status: PaymentStatus; authorizationCode: string | null; message: string; session: PaymentSession; }
export interface PaymentTransaction extends PaymentResponse { id: string; amount: number; createdAt: string; updatedAt: string; events: PaymentEvent[]; }
export interface PaymentTransactionLog { date: string; time: string; sessionId: string; provider: string; amount: number; status: PaymentStatus; durationMs: number; }
export type PaymentProgressListener = (response: PaymentResponse) => void;
export type MockFailureMode = "DECLINED" | "CANCELLED" | "TIMEOUT" | "COMMUNICATION_LOST";

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = { provider: "MOCK", timeout: 60, retryAttempts: 1, autoConfirm: false, logTransactions: true };
const SETTINGS_KEY = "baristaos.payment.settings.v1";
const LOG_KEY = "baristaos.payment.transactions.v1";
const SEQUENCE_KEY = "baristaos.payment.mock-sequence.v1";
const MIN_STATE_DELAY_MS = 300;
const MAX_STATE_DELAY_MS = 800;

class PaymentService {
  private readonly transactions = new Map<string, PaymentTransaction>();
  private readonly sessions = new Map<string, PaymentSession>();
  private sequence = this.loadSequence();
  private failureMode: MockFailureMode | null = null;
  private settings = this.loadSettings();

  async startPayment(request: PaymentRequest, onProgress?: PaymentProgressListener): Promise<PaymentResponse> {
    const transactionId = this.nextTransactionId();
    this.createTransaction(transactionId, request.amount);
    this.emit(transactionId, "CREATED", "Sessão iniciada.", onProgress);
    const authorization = async () => {
      await this.transition(transactionId, "WAITING_DEVICE", "Aguardando dispositivo.", onProgress);
      await this.transition(transactionId, "CARD_INSERTED", "Cartão inserido.", onProgress);
      await this.transition(transactionId, "PROCESSING", "Processando pagamento.", onProgress);
      if (this.failureMode) { await this.delay(); return this.emitFailure(transactionId, this.failureMode, onProgress); }
      await this.delay();
      return this.emit(transactionId, "AUTHORIZED", "Pagamento autorizado.", onProgress, "123456");
    };
    return this.withTimeout(transactionId, authorization(), onProgress);
  }

  async cancelPayment(transactionId: string, onProgress?: PaymentProgressListener) { return this.emit(transactionId, "CANCELLED", "Pagamento cancelado pelo operador.", onProgress); }
  async confirmPayment(transactionId: string, onProgress?: PaymentProgressListener) {
    const current = this.transactions.get(transactionId);
    if (current?.status !== "AUTHORIZED") return this.emit(transactionId, "FAILED", "Somente pagamentos autorizados podem ser confirmados.", onProgress);
    await this.delay(); return this.emit(transactionId, "CONFIRMED", "Confirmando venda...", onProgress, current.authorizationCode);
  }
  async finishTransaction(transactionId: string, onProgress?: PaymentProgressListener) {
    const current = this.transactions.get(transactionId);
    if (current?.status !== "CONFIRMED") return this.emit(transactionId, "FAILED", "Somente pagamentos confirmados podem ser finalizados.", onProgress);
    await this.delay(); return this.emit(transactionId, "FINISHED", "Venda concluída.", onProgress, current.authorizationCode);
  }

  getTransaction(transactionId: string) { return this.transactions.get(transactionId); }
  getSession(transactionId: string) { return this.sessions.get(transactionId); }
  configureFailure(mode: MockFailureMode | null) { this.failureMode = mode; }
  getSettings(): PaymentSettings { return { ...this.settings }; }
  updateSettings(settings: PaymentSettings) { this.settings = { ...settings, retryAttempts: Math.max(0, Math.trunc(settings.retryAttempts)) }; localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); return this.getSettings(); }
  getTransactionLogs(): PaymentTransactionLog[] { try { return JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]") as PaymentTransactionLog[]; } catch { return []; } }

  private createSession(saleId: string, transactionId: string, amount: number): PaymentSession {
    const timestamp = new Date().toISOString();
    const event: PaymentEvent = { timestamp, status: "CREATED", message: "Sessão iniciada." };
    const session: PaymentSession = { sessionId: `MOCK-SESSION-${String(this.sequence).padStart(5, "0")}`, saleId, provider: "MockProvider", status: "CREATED", amount, timeoutSeconds: this.settings.timeout, startedAt: timestamp, finishedAt: null, lastEvent: event, events: [] };
    this.sessions.set(transactionId, session); return session;
  }
  private appendEvent(transactionId: string, status: PaymentStatus, message: string) {
    const current = this.requireSession(transactionId); const event = { timestamp: new Date().toISOString(), status, message };
    const updated = { ...current, status, lastEvent: event, events: [...current.events, event] }; this.sessions.set(transactionId, updated); return updated;
  }
  private closeSession(transactionId: string) { const current = this.requireSession(transactionId); const updated = { ...current, finishedAt: new Date().toISOString() }; this.sessions.set(transactionId, updated); this.writeTransactionLog(updated); return updated; }
  private createTransaction(transactionId: string, amount: number) { const now = new Date().toISOString(); const session = this.createSession(transactionId, transactionId, amount); this.transactions.set(transactionId, { id: transactionId, transactionId, provider: "MockProvider", status: "CREATED", authorizationCode: null, message: "Sessão iniciada.", amount, createdAt: now, updatedAt: now, events: [], session }); }
  private async transition(transactionId: string, status: PaymentStatus, message: string, listener?: PaymentProgressListener) { await this.delay(); return this.emit(transactionId, status, message, listener); }
  private emit(transactionId: string, status: PaymentStatus, message: string, listener?: PaymentProgressListener, authorizationCode: string | null = null): PaymentResponse {
    let session = this.appendEvent(transactionId, status, message);
    if (["FINISHED", "CANCELLED", "FAILED", "TIMEOUT", "COMMUNICATION_ERROR"].includes(status)) session = this.closeSession(transactionId);
    const response = { transactionId, provider: "MockProvider", status, authorizationCode, message, session };
    const current = this.transactions.get(transactionId);
    if (current) { const timestamp = new Date().toISOString(); this.transactions.set(transactionId, { ...current, ...response, updatedAt: timestamp, events: [...current.events, { timestamp, status, message }] }); console.info("[PaymentSession]", timestamp, session.sessionId, status, message); }
    listener?.(response); return response;
  }
  private emitFailure(transactionId: string, mode: MockFailureMode, listener?: PaymentProgressListener) {
    const messages: Record<MockFailureMode, string> = { DECLINED: "Pagamento não autorizado. Tente novamente ou escolha outra forma de pagamento.", CANCELLED: "Pagamento cancelado no terminal.", TIMEOUT: `O PinPad não respondeu em ${this.settings.timeout} segundos. Verifique o dispositivo e tente novamente.`, COMMUNICATION_LOST: "Não foi possível comunicar com a operadora. Verifique a conexão e tente novamente." };
    const status: PaymentStatus = mode === "CANCELLED" ? "CANCELLED" : mode === "TIMEOUT" ? "TIMEOUT" : mode === "COMMUNICATION_LOST" ? "COMMUNICATION_ERROR" : "FAILED";
    return this.emit(transactionId, status, messages[mode], listener);
  }
  private withTimeout(transactionId: string, operation: Promise<PaymentResponse>, listener?: PaymentProgressListener) { let handle = 0; const timeout = new Promise<PaymentResponse>(resolve => { handle = window.setTimeout(() => resolve(this.emit(transactionId, "TIMEOUT", `O PinPad não respondeu em ${this.settings.timeout} segundos. Verifique o dispositivo e tente novamente.`, listener)), this.settings.timeout * 1000); }); return Promise.race([operation, timeout]).finally(() => window.clearTimeout(handle)); }
  private loadSettings(): PaymentSettings { try { return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") }; } catch { return { ...DEFAULT_PAYMENT_SETTINGS }; } }
  private writeTransactionLog(session: PaymentSession) { if (!this.settings.logTransactions || !session.finishedAt) return; const logs = this.getTransactionLogs(); if (logs.some(log => log.sessionId === session.sessionId)) return; const finishedAt = new Date(session.finishedAt); logs.unshift({ date: finishedAt.toLocaleDateString("pt-BR"), time: finishedAt.toLocaleTimeString("pt-BR"), sessionId: session.sessionId, provider: session.provider, amount: session.amount, status: session.status, durationMs: Math.max(0, finishedAt.getTime() - new Date(session.startedAt).getTime()) }); localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 500))); }
  private requireSession(transactionId: string) { const session = this.sessions.get(transactionId); if (!session) throw new Error("Sessão de pagamento não encontrada."); return session; }
  private loadSequence() {
    const stored = Number(localStorage.getItem(SEQUENCE_KEY));
    const highestLogged = this.getTransactionLogs().reduce((highest, log) => {
      const match = log.sessionId.match(/^MOCK-SESSION-(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return Math.max(Number.isSafeInteger(stored) && stored >= 0 ? stored : 0, highestLogged);
  }
  private nextTransactionId() {
    this.sequence += 1;
    localStorage.setItem(SEQUENCE_KEY, String(this.sequence));
    return `MOCK-${String(this.sequence).padStart(6, "0")}`;
  }
  private delay() { const milliseconds = Math.floor(Math.random() * (MAX_STATE_DELAY_MS - MIN_STATE_DELAY_MS + 1)) + MIN_STATE_DELAY_MS; return new Promise<void>(resolve => window.setTimeout(resolve, milliseconds)); }
}

export const paymentService = new PaymentService();
