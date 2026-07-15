import type { FastifyPluginAsync } from "fastify";
import { closeCashSchema, openCashSchema } from "./cash.schemas.js";
import { closeCash, getCurrentCash, openCash } from "./cash.service.js";

export const cashRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);
  app.get("/current", async request => ({ data: await getCurrentCash(app, request.user.storeId) }));
  app.post("/open", async (request, reply) => reply.code(201).send(
    await openCash(app, request.user.storeId, request.user.sub, openCashSchema.parse(request.body))
  ));
  app.post("/close", async request => closeCash(app, request.user.storeId, closeCashSchema.parse(request.body)));
};
