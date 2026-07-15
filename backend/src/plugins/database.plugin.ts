import fp from "fastify-plugin";
import { prisma } from "./prisma.js";

export default fp(async function databasePlugin(app) {
  app.decorate("prisma", prisma);
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
