import axios,{AxiosError,type AxiosRequestConfig,type InternalAxiosRequestConfig} from "axios";
import type {RefreshResponse} from "../../types/auth";
import {authEvents} from "./auth-events";
import {tokenStorage} from "./token-storage";
const baseURL=(import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1").replace(/\/$/,"");
export const httpClient=axios.create({baseURL,timeout:12000,headers:{"Content-Type":"application/json"}});
const refreshClient=axios.create({baseURL,timeout:12000,headers:{"Content-Type":"application/json"}});
interface RetryConfig extends InternalAxiosRequestConfig{_retry?:boolean}
let refreshPromise:Promise<string>|null=null;
async function renewAccessToken(){const refreshToken=tokenStorage.getRefreshToken();if(!refreshToken)throw new Error("Refresh token ausente.");const r=await refreshClient.post<RefreshResponse>("/auth/refresh",{refreshToken});tokenStorage.saveAccessToken(r.data.accessToken);return r.data.accessToken;}
httpClient.interceptors.request.use(config=>{const token=tokenStorage.getAccessToken();if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
httpClient.interceptors.response.use(r=>r,async(error:AxiosError)=>{const req=error.config as RetryConfig|undefined;const unauthorized=error.response?.status===401;const authEndpoint=req?.url?.includes("/auth/login")||req?.url?.includes("/auth/refresh");if(!req||!unauthorized||authEndpoint||req._retry)return Promise.reject(error);req._retry=true;try{refreshPromise ??= renewAccessToken().finally(()=>{refreshPromise=null});const token=await refreshPromise;req.headers.Authorization=`Bearer ${token}`;return httpClient(req);}catch(e){tokenStorage.clear();authEvents.emitSessionExpired();return Promise.reject(e);}});
export async function apiRequest<T>(config:AxiosRequestConfig):Promise<T>{const r=await httpClient.request<T>(config);return r.data;}
