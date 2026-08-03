/** Integration boundary reserved for v3.5.0; no fiscal operation is active in v3.4.1. */
export interface FiscalIntegrationService {
  issueNfce(saleId: string, paymentSessionId: string): Promise<{ accessKey: string; xml: string }>;
  printDanfe(accessKey: string): Promise<void>;
  storeXml(accessKey: string, xml: string): Promise<void>;
  cancelNfce(accessKey: string, reason: string): Promise<void>;
}
