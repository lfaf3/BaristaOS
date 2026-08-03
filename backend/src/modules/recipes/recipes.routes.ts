import type { FastifyPluginAsync } from "fastify";
import {
  createRecipeSchema,
  recipeListQuerySchema,
  recipeParamsSchema,
  updateRecipeSchema
} from "./recipes.schemas.js";
import {
  createRecipe,
  deactivateRecipe,
  getRecipe,
  listRecipes,
  updateRecipe
} from "./recipes.service.js";

export const recipesRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async request => {
    const query = recipeListQuerySchema.parse(request.query);
    return listRecipes(app, request.user.companyId, query);
  });

  app.get("/:id", async request => {
    const { id } = recipeParamsSchema.parse(request.params);
    return getRecipe(app, request.user.companyId, id);
  });

  app.post("/", async (request, reply) => {
    const input = createRecipeSchema.parse(request.body);
    const recipe = await createRecipe(app, request.user.companyId, input);
    return reply.code(201).send(recipe);
  });

  app.patch("/:id", async request => {
    const { id } = recipeParamsSchema.parse(request.params);
    const input = updateRecipeSchema.parse(request.body);
    return updateRecipe(app, request.user.companyId, id, input);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = recipeParamsSchema.parse(request.params);
    await deactivateRecipe(app, request.user.companyId, id);
    return reply.code(204).send();
  });
};
