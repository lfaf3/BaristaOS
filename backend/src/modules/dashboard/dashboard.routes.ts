import type { FastifyPluginAsync } from "fastify";
import { getDashboardSummary } from "./dashboard.service.js";

export const dashboardRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/summary", async request =>
    getDashboardSummary(app, request.user.storeId)
  );
};
