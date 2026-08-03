import { randomUUID } from "node:crypto";
import { env } from "../../../config/env.js";
import type {
  TefProvider,
  TefProviderResult,
  TefTransactionInput
} from "./tef-provider.js";

const transactions = new Map<string, TefProviderResult>();

export class SimulatedTefProvider implements TefProvider {
  readonly code = "SIMULATED" as const;

  async startTransaction(input: TefTransactionInput): Promise<TefProviderResult> {
    const externalId = `SIM-${randomUUID()}`;
    let result: TefProviderResult;

    if (env.TEF_SIMULATOR_OUTCOME === "DECLINED") {
      result = { status: "DECLINED", externalId, errorCode: "SIM_DECLINED", errorMessage: "Transação recusada pelo simulador." };
    } else if (env.TEF_SIMULATOR_OUTCOME === "FAILED") {
      result = { status: "FAILED", externalId, errorCode: "SIM_FAILED", errorMessage: "Falha de comunicação simulada." };
    } else if (env.TEF_SIMULATOR_OUTCOME === "UNKNOWN") {
      result = { status: "UNKNOWN", externalId, errorCode: "SIM_UNKNOWN", errorMessage: "Resultado da transação não confirmado." };
    } else {
      result = {
        status: "AUTHORIZED",
        externalId,
        nsu: String(Date.now()).slice(-9),
        authorizationCode: randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase(),
        cardBrand: input.method === "TEF_CREDIT" ? "VISA" : "MASTERCARD",
        customerReceipt: `TEF SIMULADO\nTRANSAÇÃO ${externalId}\nVALOR ${input.amount.toFixed(2)}`,
        merchantReceipt: `TEF SIMULADO - VIA ESTABELECIMENTO\nTRANSAÇÃO ${externalId}`
      };
    }

    transactions.set(externalId, result);
    return result;
  }

  async getTransactionStatus(reference: string): Promise<TefProviderResult> {
    return transactions.get(reference) ?? {
      status: "UNKNOWN",
      externalId: reference,
      errorCode: "SIM_NOT_FOUND",
      errorMessage: "Transação não encontrada no simulador."
    };
  }

  async confirmTransaction(reference: string): Promise<TefProviderResult> {
    const current = await this.getTransactionStatus(reference);
    if (current.status !== "AUTHORIZED") return current;
    const confirmed = { ...current, status: "CONFIRMED" as const };
    transactions.set(reference, confirmed);
    return confirmed;
  }

  async cancelTransaction(reference: string): Promise<TefProviderResult> {
    const current = await this.getTransactionStatus(reference);
    const cancelled = { ...current, status: "FAILED" as const, errorCode: "SIM_CANCELLED", errorMessage: "Transação cancelada." };
    transactions.set(reference, cancelled);
    return cancelled;
  }
}
