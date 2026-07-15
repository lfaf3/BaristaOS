import "@fastify/jwt";
import type { PrismaClient } from "../../generated/prisma/client.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string; companyId: string; storeId: string; role: string; type: "access";
    };
    user: {
      sub: string; companyId: string; storeId: string; role: string; type: "access";
    };
  }
}
