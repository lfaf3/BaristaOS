import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { verifyPassword } from "../../shared/security/password.js";
import { hashToken } from "../../shared/security/token-hash.js";
import type { LoginInput } from "./auth.schemas.js";

function durationMs(value: string) {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error(`Duração inválida: ${value}`);
  const amount = Number(match[1]);
  return amount * ({ s:1000, m:60000, h:3600000, d:86400000 }[match[2]!] ?? 0);
}

export async function login(app: FastifyInstance, input: LoginInput) {
  const user = await app.prisma.user.findFirst({
    where: { email: input.email, status: "ACTIVE" },
    include: { role: true, stores: { include: { store: true } } }
  });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS");
  }
  const available = user.stores.filter(x => x.store.active);
  const store = available.find(x => x.storeId === input.storeId)?.store ?? available[0]?.store;
  if (!store) throw new AppError("Usuário sem loja ativa vinculada.", 403, "NO_ACTIVE_STORE");

  const accessToken = app.jwt.sign({
    sub:user.id, companyId:user.companyId, storeId:store.id, role:user.role.code, type:"access"
  }, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

  const refreshToken = randomUUID()+randomUUID();
  await app.prisma.refreshToken.create({
    data:{
      userId:user.id,
      tokenHash:hashToken(refreshToken),
      expiresAt:new Date(Date.now()+durationMs(env.JWT_REFRESH_EXPIRES_IN))
    }
  });
  await app.prisma.user.update({ where:{id:user.id}, data:{lastLoginAt:new Date()} });

  return {
    accessToken, refreshToken, expiresIn:env.JWT_ACCESS_EXPIRES_IN,
    user:{
      id:user.id,name:user.name,email:user.email,role:user.role.code,
      companyId:user.companyId,
      store:{id:store.id,name:store.name,code:store.code},
      availableStores:available.map(x=>({id:x.store.id,name:x.store.name,code:x.store.code}))
    }
  };
}

export async function refreshAccessToken(app: FastifyInstance, raw: string) {
  const token = await app.prisma.refreshToken.findUnique({
    where:{tokenHash:hashToken(raw)},
    include:{user:{include:{role:true,stores:{include:{store:true}}}}}
  });
  if (!token || token.revokedAt || token.expiresAt <= new Date() || token.user.status !== "ACTIVE") {
    throw new AppError("Refresh token inválido ou expirado.",401,"INVALID_REFRESH_TOKEN");
  }
  const store = token.user.stores.find(x=>x.store.active)?.store;
  if (!store) throw new AppError("Usuário sem loja ativa vinculada.",403,"NO_ACTIVE_STORE");
  const accessToken = app.jwt.sign({
    sub:token.user.id,companyId:token.user.companyId,storeId:store.id,
    role:token.user.role.code,type:"access"
  },{expiresIn:env.JWT_ACCESS_EXPIRES_IN});
  return {accessToken,expiresIn:env.JWT_ACCESS_EXPIRES_IN};
}

export async function revokeRefreshToken(app: FastifyInstance, raw: string) {
  await app.prisma.refreshToken.updateMany({
    where:{tokenHash:hashToken(raw),revokedAt:null},data:{revokedAt:new Date()}
  });
}
