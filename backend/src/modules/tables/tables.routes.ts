import type { FastifyPluginAsync } from "fastify";
import {
  getTable,
  listTables,
  openTable,
  setTableStatus
} from "./tables.service.js";
import {
  addTableOrderItem,
  closeTableOrder,
  deleteTableOrderItem,
  getTableOrder,
  updateTableOrderItem
} from "./tables.order.service.js";
import {
  tableParamsSchema,
  updateTableStatusSchema
} from "./tables.schemas.js";
import {
  addOrderItemSchema,
  closeTableOrderSchema,
  orderItemParamsSchema,
  updateOrderItemSchema
} from "./tables.order.schemas.js";

export const tablesRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async request => listTables(app, request.user.storeId));

  app.get("/:id", async request =>
    getTable(app, request.user.storeId, tableParamsSchema.parse(request.params).id)
  );

  app.get("/:id/order", async request => {
    const { id } = tableParamsSchema.parse(request.params);
    return getTableOrder(app, request.user.storeId, id);
  });

  app.post("/:id/order/items", async (request, reply) => {
    const { id } = tableParamsSchema.parse(request.params);
    const input = addOrderItemSchema.parse(request.body);
    return reply.code(201).send(
      await addTableOrderItem(
        app,
        request.user.companyId,
        request.user.storeId,
        request.user.sub,
        id,
        input
      )
    );
  });

  app.patch("/:id/order/items/:itemId", async request => {
    const { id, itemId } = orderItemParamsSchema.parse(request.params);
    const input = updateOrderItemSchema.parse(request.body);
    return updateTableOrderItem(app, request.user.storeId, id, itemId, input);
  });

  app.delete("/:id/order/items/:itemId", async request => {
    const { id, itemId } = orderItemParamsSchema.parse(request.params);
    return deleteTableOrderItem(app, request.user.storeId, id, itemId);
  });

  app.patch("/:id/order/close", async request => {
    const { id } = tableParamsSchema.parse(request.params);
    const input = closeTableOrderSchema.parse(request.body);
    return closeTableOrder(app, request.user.storeId, id, input);
  });

  app.patch("/:id/open", async request => {
    const { id } = tableParamsSchema.parse(request.params);
    return openTable(app, request.user.storeId, id);
  });

  app.patch("/:id/status", async request => {
    const { id } = tableParamsSchema.parse(request.params);
    const { status } = updateTableStatusSchema.parse(request.body);
    return setTableStatus(app, request.user.storeId, id, status);
  });
};
