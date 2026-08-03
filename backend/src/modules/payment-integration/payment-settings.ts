export const PAYMENT_TIMEOUTS = [30, 60, 120] as const;
export type PaymentTimeoutSeconds = typeof PAYMENT_TIMEOUTS[number];
export type PaymentProviderCode = "MOCK" | "SITEF" | "PAYGO";

export interface PaymentSettings {
  provider: PaymentProviderCode;
  timeout: PaymentTimeoutSeconds;
  retryAttempts: number;
  autoConfirm: boolean;
  logTransactions: boolean;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  provider: "MOCK", timeout: 60, retryAttempts: 1, autoConfirm: false, logTransactions: true
};

/** In-memory store. Replace this implementation when persistent settings are introduced. */
export class PaymentSettingsStore {
  constructor(private settings: PaymentSettings = DEFAULT_PAYMENT_SETTINGS) {}
  get(): PaymentSettings { return { ...this.settings }; }
  update(settings: PaymentSettings): PaymentSettings {
    if (!PAYMENT_TIMEOUTS.includes(settings.timeout)) throw new Error("Timeout de pagamento inválido.");
    this.settings = { ...settings, retryAttempts: Math.max(0, Math.trunc(settings.retryAttempts)) };
    return this.get();
  }
}
