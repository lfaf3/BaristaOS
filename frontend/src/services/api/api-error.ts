import axios from "axios";
interface BackendErrorBody { error?:{code?:string;message?:string;details?:unknown}; }
export class ApiError extends Error {
  constructor(message:string, public readonly status?:number, public readonly code="API_ERROR", public readonly details?:unknown){super(message);this.name="ApiError";}
}
export function normalizeApiError(error:unknown):ApiError {
  if(error instanceof ApiError) return error;
  if(axios.isAxiosError<BackendErrorBody>(error)){
    if(error.code==="ERR_NETWORK") return new ApiError("Não foi possível conectar ao servidor. Verifique se o backend está em execução.",undefined,"NETWORK_ERROR");
    const backendError=error.response?.data?.error;
    return new ApiError(backendError?.message ?? "Não foi possível concluir a operação.",error.response?.status,backendError?.code ?? "HTTP_ERROR",backendError?.details);
  }
  if(error instanceof Error) return new ApiError(error.message);
  return new ApiError("Ocorreu um erro inesperado.");
}
