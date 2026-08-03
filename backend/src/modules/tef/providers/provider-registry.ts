import { AppError } from "../../../shared/errors/app-error.js";
import { SimulatedTefProvider } from "./simulated-tef-provider.js";
import type { TefProvider } from "./tef-provider.js";

const providers = new Map<string, TefProvider>([
  ["SIMULATED", new SimulatedTefProvider()]
]);

export function getTefProvider(code: string): TefProvider {
  const provider = providers.get(code);
  if (!provider) {
    throw new AppError(
      `O adaptador TEF ${code} ainda não está instalado.`,
      503,
      "TEF_PROVIDER_NOT_AVAILABLE"
    );
  }
  return provider;
}
