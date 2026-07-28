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
export function normalizeApiError(error:unknown):ApiError {
  if(error instanceof ApiError) return error;
  if(axios.isAxiosError<BackendErrorBody>(error)){
    if(error.code==="ERR_NETWORK") return new ApiError("Não foi possível conectar ao servidor. Verifique se o backend está em execução.",undefined,"NETWORK_ERROR");
    const body=error.response?.data;
    const nestedError=body?.error && typeof body.error === "object" ? body.error : undefined;
    const message=nestedError?.message ?? body?.message ?? "Não foi possível concluir a operação.";
    const code=nestedError?.code ?? body?.code ?? "HTTP_ERROR";
    const details=nestedError?.details ?? body?.details;
    return new ApiError(message,error.response?.status,code,details);
  }
  if(error instanceof Error) return new ApiError(error.message);
  return new ApiError("Ocorreu um erro inesperado.");
}
