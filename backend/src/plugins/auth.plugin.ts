import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { env } from "../config/env.js";

export default fp(async function authPlugin(app) {
  await app.register(jwt, { secret: env.JWT_ACCESS_SECRET });
  app.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      await reply.unauthorized("Token de acesso inválido ou expirado.");
    }
  });
});
