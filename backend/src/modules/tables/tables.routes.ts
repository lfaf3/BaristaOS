import type { FastifyPluginAsync } from "fastify";
import {
  getTable,
  listTables,
  openTable,
  setTableStatus
} from "./tables.service.js";
import { getTableOrder } from "./tables.order.service.js";
import {
  tableParamsSchema,
  updateTableStatusSchema
} from "./tables.schemas.js";

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
