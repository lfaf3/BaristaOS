/** Port reserved for v3.5.0 and invoked only after payment confirmation. */
export interface FiscalIntegration {
  issueNfce(saleId: string, paymentSessionId: string): Promise<{ accessKey: string; xml: string }>;
  printDanfe(accessKey: string): Promise<void>;
  storeXml(accessKey: string, xml: string): Promise<void>;
  cancelNfce(accessKey: string, reason: string): Promise<void>;
}
