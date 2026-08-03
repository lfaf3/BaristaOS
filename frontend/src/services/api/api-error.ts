import axios from "axios";
interface BackendErrorBody {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: unknown;
  error?: { code?: string; message?: string; details?: unknown } | string;
}
export class ApiError extends Error {
  constructor(message:string, public readonly status?:number, public readonly code="API_ERROR", public readonly details?:unknown){super(message);this.name="ApiError";}
}
const friendlyMessages: Record<string, string> = {
  ATTENDANCE_LABEL_ALREADY_EXISTS: "Já existe um atendimento aberto com esta identificação.",
  OPEN_ORDER_NOT_FOUND: "Nenhuma comanda aberta foi encontrada para esta mesa.",
  ORDER_HAS_ITEMS: "Não é possível cancelar um atendimento que possui itens.",
  ORDER_HAS_PAYMENTS: "Não é possível cancelar um atendimento que possui pagamentos.",
  TEF_TRANSACTION_IN_PROGRESS: "Já existe uma transação de cartão em andamento. Consulte-a antes de tentar novamente.",
  TEF_AMOUNT_MISMATCH: "O pagamento no cartão deve quitar exatamente o saldo da conta.",
  TEF_PROVIDER_NOT_AVAILABLE: "O provedor TEF configurado não está disponível.",
  TEF_DISABLED: "O TEF está desabilitado para esta loja.",
  TEF_IDEMPOTENCY_CONFLICT: "Não foi possível reutilizar esta tentativa de pagamento.",
  NETWORK_ERROR: "Não foi possível conectar ao servidor. Verifique a conexão e tente novamente."
};
export function normalizeApiError(error:unknown):ApiError {
  if(error instanceof ApiError) return error;
  if(axios.isAxiosError<BackendErrorBody>(error)){
    if(error.code==="ERR_NETWORK") return new ApiError("Não foi possível conectar ao servidor. Verifique se o backend está em execução.",undefined,"NETWORK_ERROR");
    const body=error.response?.data;
    const nestedError=body?.error && typeof body.error === "object" ? body.error : undefined;
    const message=nestedError?.message ?? body?.message ?? "Não foi possível concluir a operação.";
    const code=nestedError?.code ?? body?.code ?? "HTTP_ERROR";
    const details=nestedError?.details ?? body?.details;
    return new ApiError(friendlyMessages[code] ?? message,error.response?.status,code,details);
  }
  if(error instanceof Error) return new ApiError(error.message);
  return new ApiError("Ocorreu um erro inesperado.");
}
