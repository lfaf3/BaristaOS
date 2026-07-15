import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import type {AuthUser,LoginRequest} from "../types/auth";
import {authEvents} from "../services/api/auth-events";import {normalizeApiError} from "../services/api/api-error";import {authService} from "../services/api/auth.service";import {tokenStorage} from "../services/api/token-storage";
type AuthStatus="loading"|"authenticated"|"anonymous";
interface Value{status:AuthStatus;user:AuthUser|null;error:string|null;login:(i:LoginRequest)=>Promise<void>;logout:()=>Promise<void>;clearError:()=>void}
const Ctx=createContext<Value|null>(null);
export function AuthProvider({children}:{children:ReactNode}){const[status,setStatus]=useState<AuthStatus>("loading");const[user,setUser]=useState<AuthUser|null>(()=>tokenStorage.getUser<AuthUser>());const[error,setError]=useState<string|null>(null);
 const clearSession=useCallback(()=>{tokenStorage.clear();setUser(null);setStatus("anonymous")},[]);
 useEffect(()=>{const unsubscribe=authEvents.subscribe(clearSession);return unsubscribe;},[clearSession]);
 useEffect(()=>{let active=true;(async()=>{const a=tokenStorage.getAccessToken(),r=tokenStorage.getRefreshToken();if(!a&&!r){if(active)setStatus("anonymous");return}try{const current=await authService.currentUser();const cached=tokenStorage.getUser<AuthUser>();if(!cached)throw new Error("Sessão local ausente");const restored={...cached,id:current.id,name:current.name,email:current.email,role:current.role.code};tokenStorage.saveUser(restored);if(active){setUser(restored);setStatus("authenticated")}}catch{clearSession()}})();return()=>{active=false}},[clearSession]);
 const login=useCallback(async(input:LoginRequest)=>{setError(null);try{const r=await authService.login(input);setUser(r.user);setStatus("authenticated")}catch(c){const e=normalizeApiError(c);setError(e.message);setStatus("anonymous");throw e}},[]);
 const logout=useCallback(async()=>{try{await authService.logout()}finally{clearSession()}},[clearSession]);
 const value=useMemo<Value>(()=>({status,user,error,login,logout,clearError:()=>setError(null)}),[status,user,error,login,logout]);return <Ctx.Provider value={value}>{children}</Ctx.Provider>}
export function useAuth(){const c=useContext(Ctx);if(!c)throw new Error("useAuth deve ser usado dentro de AuthProvider");return c;}
