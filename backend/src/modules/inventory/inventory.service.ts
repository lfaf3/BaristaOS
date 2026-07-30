import type { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

type CreateItem = { name:string; category:string; unit:"KG"|"G"|"L"|"ML"|"UNIT"; currentStock:number; minimumStock:number; unitCost:number; supplier?:string|null|undefined };
type UpdateItem = {
  name?: string | undefined;
  category?: string | undefined;
  unit?: "KG" | "G" | "L" | "ML" | "UNIT" | undefined;
  currentStock?: number | undefined;
  minimumStock?: number | undefined;
  unitCost?: number | undefined;
  supplier?: string | null | undefined;
  active?: boolean | undefined;
};
type Movement = { type:"ENTRY"|"EXIT"|"ADJUSTMENT"; quantity:number; note?:string|null|undefined };

const serializeItem = (item:any) => ({ ...item, currentStock:Number(item.currentStock), minimumStock:Number(item.minimumStock), unitCost:Number(item.unitCost), isLowStock:Number(item.currentStock) <= Number(item.minimumStock) });
const serializeMovement = (m:any) => ({ ...m, quantity:Number(m.quantity), previousStock:Number(m.previousStock), resultingStock:Number(m.resultingStock) });

export async function listInventory(app:FastifyInstance, companyId:string, query:{q?:string|undefined;category?:string|undefined;lowStock?:boolean|undefined;active?:boolean|undefined}) {
  const where:any = { companyId };
  if (typeof query.active === "boolean") where.active=query.active; else where.active=true;
  if (query.category) where.category=query.category;
  if (query.q) where.OR=[{name:{contains:query.q,mode:"insensitive"}},{category:{contains:query.q,mode:"insensitive"}},{supplier:{contains:query.q,mode:"insensitive"}}];
  const items=await app.prisma.inventoryItem.findMany({where,orderBy:[{category:"asc"},{name:"asc"}]});
  const data=items.map(serializeItem).filter((i:any)=>!query.lowStock||i.isLowStock);
  return {data,summary:{total:data.length,lowStock:data.filter((i:any)=>i.isLowStock).length,totalValue:data.reduce((s:number,i:any)=>s+i.currentStock*i.unitCost,0),categories:new Set(data.map((i:any)=>i.category)).size}};
}
export async function createInventoryItem(app:FastifyInstance, companyId:string, userId:string, input:CreateItem) {
  try {
    return await app.prisma.$transaction(async tx=>{
      const item=await tx.inventoryItem.create({data:{companyId,...input,supplier:input.supplier||null}});
      if(input.currentStock>0) await tx.inventoryMovement.create({data:{itemId:item.id,userId,type:"ADJUSTMENT",quantity:input.currentStock,previousStock:0,resultingStock:input.currentStock,note:"Saldo inicial"}});
      return serializeItem(item);
    });
  } catch(error:any) { if(error?.code==="P2002") throw new AppError("Já existe um item de estoque com esse nome.",409,"INVENTORY_ITEM_EXISTS"); throw error; }
}
export async function updateInventoryItem(app:FastifyInstance, companyId:string, id:string, input:UpdateItem) {
  const current=await app.prisma.inventoryItem.findFirst({where:{id,companyId}}); if(!current) throw new AppError("Item de estoque não encontrado.",404,"INVENTORY_ITEM_NOT_FOUND");
  const {currentStock:_ignored,...data}=input;
  const payload=Object.fromEntries(Object.entries(data).filter(([,value])=>value!==undefined)) as Record<string,unknown>;
  if("supplier" in payload) payload.supplier=(payload.supplier as string|null|undefined)||null;
  try { return serializeItem(await app.prisma.inventoryItem.update({where:{id},data:payload})); }
  catch(error:any){ if(error?.code==="P2002") throw new AppError("Já existe um item de estoque com esse nome.",409,"INVENTORY_ITEM_EXISTS"); throw error; }
}
export async function createMovement(app:FastifyInstance, companyId:string, userId:string, id:string, input:Movement) {
  return app.prisma.$transaction(async tx=>{
    const item=await tx.inventoryItem.findFirst({where:{id,companyId,active:true}}); if(!item) throw new AppError("Item de estoque não encontrado.",404,"INVENTORY_ITEM_NOT_FOUND");
    const previous=Number(item.currentStock); let resulting=previous;
    if(input.type==="ENTRY") resulting=previous+input.quantity;
    if(input.type==="EXIT") resulting=previous-input.quantity;
    if(input.type==="ADJUSTMENT") resulting=input.quantity;
    if(resulting<0) throw new AppError("A saída é maior que o saldo disponível.",422,"INSUFFICIENT_STOCK");
    const updated=await tx.inventoryItem.update({where:{id},data:{currentStock:resulting}});
    const movement=await tx.inventoryMovement.create({data:{itemId:id,userId,type:input.type,quantity:input.quantity,previousStock:previous,resultingStock:resulting,note:input.note||null},include:{user:{select:{id:true,name:true}},item:{select:{id:true,name:true,unit:true}}}});
    return {item:serializeItem(updated),movement:serializeMovement(movement)};
  });
}
export async function listMovements(app:FastifyInstance, companyId:string, query:{itemId?:string|undefined;limit:number}) {
  const data=await app.prisma.inventoryMovement.findMany({where:{item:{companyId},...(query.itemId?{itemId:query.itemId}:{})},include:{user:{select:{id:true,name:true}},item:{select:{id:true,name:true,unit:true}}},orderBy:{createdAt:"desc"},take:query.limit});
  return {data:data.map(serializeMovement)};
}
