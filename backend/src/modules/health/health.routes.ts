import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async app => {
  app.get("/health", async () => ({
    status: "ok",
    service: "baristaos-api",
    version: "0.1.0",
    timestamp: new Date().toISOString()
  }));

  app.get("/ready", async (_request, reply) => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return { status: "ready", database: "connected", timestamp: new Date().toISOString() };
    } catch (error) {
      app.log.error(error);
      return reply.serviceUnavailable("Banco de dados indisponível.");
    }
  });
};
