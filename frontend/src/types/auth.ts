export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "BARISTA";

export interface StoreSummary { id:string; name:string; code:string; }
export interface AuthUser { id:string; name:string; email:string; role:UserRole; companyId:string; store:StoreSummary; availableStores:StoreSummary[]; }
export interface LoginRequest { email:string; password:string; storeId?:string; }
export interface LoginResponse { accessToken:string; refreshToken:string; expiresIn:string; user:AuthUser; }
export interface RefreshResponse { accessToken:string; expiresIn:string; }
export interface CurrentUserResponse {
  id:string; name:string; email:string; status:"ACTIVE"|"INACTIVE"|"BLOCKED"; lastLoginAt:string|null; currentStoreId:string;
  company:{id:string;name:string;tradeName:string};
  role:{code:UserRole;name:string};
  stores:Array<{store:StoreSummary & {active:boolean}}>;
}
