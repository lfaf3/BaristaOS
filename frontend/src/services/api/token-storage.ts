const ACCESS_TOKEN_KEY="baristaos.access_token";
const REFRESH_TOKEN_KEY="baristaos.refresh_token";
const USER_KEY="baristaos.user";
export const tokenStorage={
 getAccessToken:()=>localStorage.getItem(ACCESS_TOKEN_KEY),
 getRefreshToken:()=>localStorage.getItem(REFRESH_TOKEN_KEY),
 getUser<T>():T|null{const v=localStorage.getItem(USER_KEY);if(!v)return null;try{return JSON.parse(v) as T}catch{localStorage.removeItem(USER_KEY);return null}},
 saveSession(accessToken:string,refreshToken:string,user:unknown){localStorage.setItem(ACCESS_TOKEN_KEY,accessToken);localStorage.setItem(REFRESH_TOKEN_KEY,refreshToken);localStorage.setItem(USER_KEY,JSON.stringify(user));},
 saveAccessToken(accessToken:string){localStorage.setItem(ACCESS_TOKEN_KEY,accessToken);},
 saveUser(user:unknown){localStorage.setItem(USER_KEY,JSON.stringify(user));},
 clear(){localStorage.removeItem(ACCESS_TOKEN_KEY);localStorage.removeItem(REFRESH_TOKEN_KEY);localStorage.removeItem(USER_KEY);}
};
