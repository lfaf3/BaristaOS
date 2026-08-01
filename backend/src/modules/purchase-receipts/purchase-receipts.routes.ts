import type { FastifyPluginAsync } from "fastify";
import {
  createPurchaseReceiptSchema,
  purchaseReceiptOrderParamsSchema
} from "./purchase-receipts.schemas.js";
import {
  createPurchaseReceipt,
  listPurchaseReceipts
} from "./purchase-receipts.service.js";

export const purchaseReceiptsRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/:id/receipts", async request => {
    const { id } = purchaseReceiptOrderParamsSchema.parse(request.params);
    return listPurchaseReceipts(app, request.user.companyId, id);
  });

  app.post("/:id/receipts", async (request, reply) => {
    const { id } = purchaseReceiptOrderParamsSchema.parse(request.params);
    const input = createPurchaseReceiptSchema.parse(request.body);
    const receipt = await createPurchaseReceipt(
      app,
      request.user.companyId,
      request.user.sub,
      id,
      input
    );

    return reply.code(201).send(receipt);
  });
};
