import type { FastifyPluginAsync } from "fastify";
import { getTable, listTables, setTableStatus } from "./tables.service.js";
import { tableParamsSchema, updateTableStatusSchema } from "./tables.schemas.js";

export const tablesRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);
  app.get("/", async request => listTables(app, request.user.storeId));
  app.get("/:id", async request => getTable(app, request.user.storeId, tableParamsSchema.parse(request.params).id));
  app.patch("/:id/status", async request => {
    const { id } = tableParamsSchema.parse(request.params);
    const { status } = updateTableStatusSchema.parse(request.body);
    return setTableStatus(app, request.user.storeId, id, status);
  });
};
