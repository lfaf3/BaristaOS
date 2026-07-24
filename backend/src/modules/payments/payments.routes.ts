import type { FastifyPluginAsync } from "fastify";
import {
  orderPaymentParamsSchema,
  registerPaymentsSchema
} from "./payments.schemas.js";
import { registerOrderPayments } from "./payments.service.js";

export const paymentsRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.post("/:id/payments", async (request, reply) => {
    const { id } = orderPaymentParamsSchema.parse(request.params);
    const { payments } = registerPaymentsSchema.parse(request.body);

    return reply.code(201).send(
      await registerOrderPayments(app, request.user.storeId, id, payments)
    );
  });
};
