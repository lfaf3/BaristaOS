import type { FastifyPluginAsync } from "fastify";
import { getTefTransaction, startTefTransaction } from "./tef.service.js";
import {
  startTefTransactionSchema,
  tefOrderParamsSchema,
  tefTransactionParamsSchema
} from "./tef.schemas.js";

export const tefRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.post("/:id/tef/transactions", async (request, reply) => {
    const { id } = tefOrderParamsSchema.parse(request.params);
    const input = startTefTransactionSchema.parse(request.body);
    return reply.code(201).send(await startTefTransaction(app, request.user.storeId, id, input));
  });

  app.get("/:id/tef/transactions/:transactionId", async request => {
    const { id, transactionId } = tefTransactionParamsSchema.parse(request.params);
    return getTefTransaction(app, request.user.storeId, id, transactionId);
  });
};
