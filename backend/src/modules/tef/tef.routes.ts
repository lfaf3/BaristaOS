import type { FastifyPluginAsync } from "fastify";
import { getTefTransaction, listTefTransactionLogs, startTefTransaction } from "./tef.service.js";
import {
  startTefTransactionSchema,
  tefTransactionLogQuerySchema,
  tefOrderParamsSchema,
  tefTransactionParamsSchema
} from "./tef.schemas.js";

export const tefRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/tef/transactions", async request => {
    const query = tefTransactionLogQuerySchema.parse(request.query);
    return listTefTransactionLogs(app, request.user.storeId, query);
  });

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
