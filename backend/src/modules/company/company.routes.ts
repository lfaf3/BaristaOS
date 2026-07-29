import type { FastifyPluginAsync } from "fastify";
import { getCompany, updateCompany } from "./company.service.js";
import { updateCompanySchema } from "./company.schemas.js";

export const companyRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);
  app.get("/", async request => getCompany(app, request.user.companyId));
  app.put("/", async request => updateCompany(app, request.user.companyId, updateCompanySchema.parse(request.body)));
};
