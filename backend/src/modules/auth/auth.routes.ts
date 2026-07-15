import type { FastifyPluginAsync } from "fastify";
import { loginSchema, refreshSchema } from "./auth.schemas.js";
import { login, refreshAccessToken, revokeRefreshToken } from "./auth.service.js";

export const authRoutes: FastifyPluginAsync = async app => {
  app.post("/login", async (request, reply) =>
    reply.send(await login(app, loginSchema.parse(request.body)))
  );
  app.post("/refresh", async (request, reply) => {
    const {refreshToken}=refreshSchema.parse(request.body);
    return reply.send(await refreshAccessToken(app,refreshToken));
  });
  app.post("/logout", async (request, reply) => {
    const {refreshToken}=refreshSchema.parse(request.body);
    await revokeRefreshToken(app,refreshToken);
    return reply.code(204).send();
  });
};
