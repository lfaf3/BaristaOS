import type { FastifyPluginAsync } from "fastify";
import { createInventoryItemSchema, createMovementSchema, inventoryItemParamsSchema, inventoryListQuerySchema, movementListQuerySchema, updateInventoryItemSchema } from "./inventory.schemas.js";
import { createInventoryItem, createMovement, listInventory, listMovements, updateInventoryItem } from "./inventory.service.js";
export const inventoryRoutes:FastifyPluginAsync=async app=>{
  app.addHook("preHandler",app.authenticate);
  app.get("/",async request=>listInventory(app,request.user.companyId,inventoryListQuerySchema.parse(request.query)));
  app.post("/",async(request,reply)=>reply.code(201).send(await createInventoryItem(app,request.user.companyId,request.user.sub,createInventoryItemSchema.parse(request.body))));
  app.patch("/:id",async request=>{const{id}=inventoryItemParamsSchema.parse(request.params);return updateInventoryItem(app,request.user.companyId,id,updateInventoryItemSchema.parse(request.body));});
  app.post("/:id/movements",async(request,reply)=>{const{id}=inventoryItemParamsSchema.parse(request.params);return reply.code(201).send(await createMovement(app,request.user.companyId,request.user.sub,id,createMovementSchema.parse(request.body)));});
  app.get("/movements/history",async request=>listMovements(app,request.user.companyId,movementListQuerySchema.parse(request.query)));
};
