import type { FastifyPluginAsync } from "fastify";
import {
  createPurchaseOrderSchema,
  purchaseOrderListQuerySchema,
  purchaseOrderParamsSchema,
  updatePurchaseOrderSchema
} from "./purchases.schemas.js";
import {
  cancelPurchaseOrder,
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  sendPurchaseOrder,
  updatePurchaseOrder
} from "./purchases.service.js";

export const purchasesRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async request => {
    const query = purchaseOrderListQuerySchema.parse(request.query);
    return listPurchaseOrders(app, request.user.companyId, query);
  });

  app.get("/:id", async request => {
    const { id } = purchaseOrderParamsSchema.parse(request.params);
    return getPurchaseOrder(app, request.user.companyId, id);
  });

  app.post("/", async (request, reply) => {
    const input = createPurchaseOrderSchema.parse(request.body);
    const order = await createPurchaseOrder(
      app,
      request.user.companyId,
      request.user.sub,
      input
    );
    return reply.code(201).send(order);
  });

  app.patch("/:id", async request => {
    const { id } = purchaseOrderParamsSchema.parse(request.params);
    const input = updatePurchaseOrderSchema.parse(request.body);
    return updatePurchaseOrder(app, request.user.companyId, id, input);
  });

  app.post("/:id/send", async request => {
    const { id } = purchaseOrderParamsSchema.parse(request.params);
    return sendPurchaseOrder(app, request.user.companyId, id);
  });

  app.post("/:id/cancel", async request => {
    const { id } = purchaseOrderParamsSchema.parse(request.params);
    return cancelPurchaseOrder(app, request.user.companyId, id);
  });
};
