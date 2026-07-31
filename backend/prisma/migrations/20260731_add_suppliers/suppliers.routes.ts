import type { FastifyPluginAsync } from "fastify";
import {
  supplierIdParamsSchema,
  supplierListQuerySchema,
  createSupplierSchema,
  updateSupplierSchema,
} from "./suppliers.schemas.js";
import {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
} from "./suppliers.service.js";

export const suppliersRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request) =>
    listSuppliers(
      app,
      request.user.companyId,
      supplierListQuerySchema.parse(request.query),
    ),
  );

  app.get("/:id", async (request) => {
    const { id } = supplierIdParamsSchema.parse(request.params);
    return getSupplier(app, request.user.companyId, id);
  });

  app.post("/", async (request, reply) => {
    const supplier = await createSupplier(
      app,
      request.user.companyId,
      createSupplierSchema.parse(request.body),
    );
    return reply.code(201).send(supplier);
  });

  app.patch("/:id", async (request) => {
    const { id } = supplierIdParamsSchema.parse(request.params);
    return updateSupplier(
      app,
      request.user.companyId,
      id,
      updateSupplierSchema.parse(request.body),
    );
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = supplierIdParamsSchema.parse(request.params);
    await deactivateSupplier(app, request.user.companyId, id);
    return reply.code(204).send();
  });
};
