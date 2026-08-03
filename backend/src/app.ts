import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import authPlugin from "./plugins/auth.plugin.js";
import databasePlugin from "./plugins/database.plugin.js";
import { AppError } from "./shared/errors/app-error.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { categoriesRoutes } from "./modules/categories/categories.routes.js";
import { productsRoutes } from "./modules/products/products.routes.js";
import { tablesRoutes } from "./modules/tables/tables.routes.js";
import { cashRoutes } from "./modules/cash/cash.routes.js";
import { paymentsRoutes } from "./modules/payments/payments.routes.js";
import { orderHistoryRoutes } from "./modules/orders/orders.history.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { companyRoutes } from "./modules/company/company.routes.js";
import { inventoryRoutes } from "./modules/inventory/inventory.routes.js";
import { purchasesRoutes } from "./modules/purchases/purchases.routes.js";
import { purchaseReceiptsRoutes } from "./modules/purchase-receipts/purchase-receipts.routes.js";
import { recipesRoutes } from "./modules/recipes/recipes.routes.js";
import suppliersModule from "./modules/suppliers";

export async function buildApp() {
  const app=Fastify({
    logger:{level:env.LOG_LEVEL,redact:["req.headers.authorization","body.password","body.refreshToken"]},
    trustProxy:true
  });
  await app.register(sensible);
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = env.CORS_ORIGIN.split(",").map((value) => value.trim());
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  await app.register(databasePlugin);
  await app.register(authPlugin);
  await app.register(healthRoutes,{prefix:"/api/v1"});
  await app.register(authRoutes,{prefix:"/api/v1/auth"});
  await app.register(usersRoutes,{prefix:"/api/v1/users"});
  await app.register(categoriesRoutes,{prefix:"/api/v1/categories"});
  await app.register(productsRoutes,{prefix:"/api/v1/products"});
  await app.register(tablesRoutes,{prefix:"/api/v1/tables"});
  await app.register(cashRoutes,{prefix:"/api/v1/cash"});
  await app.register(paymentsRoutes,{prefix:"/api/v1/orders"});
  await app.register(orderHistoryRoutes,{prefix:"/api/v1/orders"});
  await app.register(dashboardRoutes,{prefix:"/api/v1/dashboard"});
  await app.register(companyRoutes,{prefix:"/api/v1/company"});
  await app.register(inventoryRoutes,{prefix:"/api/v1/inventory"});
  await app.register(purchasesRoutes,{prefix:"/api/v1/purchases"});
  await app.register(purchaseReceiptsRoutes,{prefix:"/api/v1/purchases"});
  await app.register(recipesRoutes,{prefix:"/api/v1/recipes"});
  await app.register(suppliersModule, {
  prefix: "/api/v1/suppliers",
});

  app.setErrorHandler((error,request,reply)=>{
    if(error instanceof ZodError) return reply.code(422).send({error:{code:"VALIDATION_ERROR",message:"Dados inválidos.",details:error.flatten()}});
    if(error instanceof AppError) return reply.code(error.statusCode).send({error:{code:error.code,message:error.message}});
    request.log.error(error);
    return reply.code(500).send({error:{code:"INTERNAL_SERVER_ERROR",message:"Ocorreu um erro interno."}});
  });
  app.setNotFoundHandler((_req,reply)=>reply.code(404).send({error:{code:"ROUTE_NOT_FOUND",message:"Rota não encontrada."}}));
  return app;
}

