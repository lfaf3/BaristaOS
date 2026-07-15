import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import authPlugin from "./plugins/auth.plugin.js";
import databasePlugin from "./plugins/database.plugin.js";
import { AppError } from "./shared/errors/app-error.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";

export async function buildApp() {
  const app=Fastify({
    logger:{level:env.LOG_LEVEL,redact:["req.headers.authorization","body.password","body.refreshToken"]},
    trustProxy:true
  });
  await app.register(sensible);
  await app.register(cors,{origin:env.CORS_ORIGIN.split(",").map(v=>v.trim()),credentials:true});
  await app.register(databasePlugin);
  await app.register(authPlugin);
  await app.register(healthRoutes,{prefix:"/api/v1"});
  await app.register(authRoutes,{prefix:"/api/v1/auth"});
  await app.register(usersRoutes,{prefix:"/api/v1/users"});

  app.setErrorHandler((error,request,reply)=>{
    if(error instanceof ZodError) return reply.code(422).send({error:{code:"VALIDATION_ERROR",message:"Dados inválidos.",details:error.flatten()}});
    if(error instanceof AppError) return reply.code(error.statusCode).send({error:{code:error.code,message:error.message}});
    request.log.error(error);
    return reply.code(500).send({error:{code:"INTERNAL_SERVER_ERROR",message:"Ocorreu um erro interno."}});
  });
  app.setNotFoundHandler((_req,reply)=>reply.code(404).send({error:{code:"ROUTE_NOT_FOUND",message:"Rota não encontrada."}}));
  return app;
}
