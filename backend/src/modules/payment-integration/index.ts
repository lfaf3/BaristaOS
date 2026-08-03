import { PaymentService } from "./payment.service.js";
import { MockPaymentProvider } from "./providers/mock-payment-provider.js";

export { PaymentService } from "./payment.service.js";
export type { PaymentRequest } from "./dtos/payment-request.js";
export type { PaymentResponse } from "./dtos/payment-response.js";
export { PaymentStatus } from "./dtos/payment-status.js";
export type { PaymentTransaction, PaymentTransactionEvent } from "./payment-transaction.js";
export type { PaymentEvent } from "./payment-event.js";
export type { PaymentSession } from "./payment-session.js";
export type { PaymentSettings, PaymentProviderCode, PaymentTimeoutSeconds } from "./payment-settings.js";
export { DEFAULT_PAYMENT_SETTINGS, PAYMENT_TIMEOUTS, PaymentSettingsStore } from "./payment-settings.js";
export type { PaymentTransactionLog } from "./payment-transaction-log.js";
export type { FiscalIntegration } from "./fiscal-integration.js";
export type { PaymentProvider, PaymentProviderCallbacks } from "./providers/payment-provider.js";
export { MockPaymentProvider } from "./providers/mock-payment-provider.js";

/** Default in-memory composition. Future TEF adapters are registered here. */
export const paymentService = new PaymentService([new MockPaymentProvider()]);
