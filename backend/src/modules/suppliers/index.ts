import { FastifyPluginAsync } from "fastify";
import { suppliersRoutes } from "./suppliers.routes";

const suppliersModule: FastifyPluginAsync = async (app) => {
  await app.register(suppliersRoutes);
};

export default suppliersModule;
