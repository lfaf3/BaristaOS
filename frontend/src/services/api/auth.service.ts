import type {CurrentUserResponse,LoginRequest,LoginResponse,RefreshResponse} from "../../types/auth";
import {apiRequest} from "./http-client";import {tokenStorage} from "./token-storage";
export const authService={
 async login(input:LoginRequest){const r=await apiRequest<LoginResponse>({method:"POST",url:"/auth/login",data:input});tokenStorage.saveSession(r.accessToken,r.refreshToken,r.user);return r;},
 currentUser(){return apiRequest<CurrentUserResponse>({method:"GET",url:"/users/me"});},
 async refresh(){const refreshToken=tokenStorage.getRefreshToken();if(!refreshToken)throw new Error("Sessão não encontrada.");const r=await apiRequest<RefreshResponse>({method:"POST",url:"/auth/refresh",data:{refreshToken}});tokenStorage.saveAccessToken(r.accessToken);return r;},
 async logout(){const refreshToken=tokenStorage.getRefreshToken();try{if(refreshToken)await apiRequest<void>({method:"POST",url:"/auth/logout",data:{refreshToken}})}finally{tokenStorage.clear();}}
};
