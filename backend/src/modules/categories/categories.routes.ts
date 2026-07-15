import type { FastifyPluginAsync } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { createCategory, listCategories } from "./categories.repository.js";
import { createCategorySchema } from "./categories.schemas.js";

export const categoriesRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async request => listCategories(app, request.user.companyId));

  app.post("/", async (request, reply) => {
    const input = createCategorySchema.parse(request.body);
    try {
      return reply.code(201).send(await createCategory(app, request.user.companyId, input));
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new AppError("Já existe uma categoria com esse código.", 409, "CATEGORY_CODE_EXISTS");
      }
      throw error;
    }
  });
};
