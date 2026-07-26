import type { FastifyPluginAsync } from "fastify";
import {
  orderHistoryParamsSchema,
  orderHistoryQuerySchema
} from "./orders.history.schemas.js";
import {
  getOrderHistoryDetail,
  listOrderHistory
} from "./orders.history.service.js";

export const orderHistoryRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/history", async request => {
    const query = orderHistoryQuerySchema.parse(request.query);
    const filters = {
      page: query.page,
      pageSize: query.pageSize,
      ...(query.dateFrom ? { dateFrom: query.dateFrom } : {}),
      ...(query.dateTo ? { dateTo: query.dateTo } : {}),
      ...(query.tableNumber ? { tableNumber: query.tableNumber } : {})
    };

    return listOrderHistory(app, request.user.storeId, filters);
  });

  app.get("/history/:id", async request => {
    const { id } = orderHistoryParamsSchema.parse(request.params);
    return getOrderHistoryDetail(app, request.user.storeId, id);
  });
};
