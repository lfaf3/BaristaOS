import type { FastifyPluginAsync } from "fastify";
import { addProduct, editProduct, getProduct, listProducts } from "./products.service.js";
import { createProductSchema, productListQuerySchema, productParamsSchema, updateProductSchema } from "./products.schemas.js";

export const productsRoutes: FastifyPluginAsync = async app => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async request => listProducts(app, request.user.companyId, productListQuerySchema.parse(request.query)));
  app.get("/:id", async request => {
    const { id } = productParamsSchema.parse(request.params);
    return getProduct(app, request.user.companyId, id);
  });
  app.post("/", async (request, reply) => reply.code(201).send(
    await addProduct(app, request.user.companyId, createProductSchema.parse(request.body))
  ));
  app.patch("/:id", async request => {
    const { id } = productParamsSchema.parse(request.params);
    return editProduct(app, request.user.companyId, id, updateProductSchema.parse(request.body));
  });
};
