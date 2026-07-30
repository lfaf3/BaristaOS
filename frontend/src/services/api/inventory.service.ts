import { apiRequest } from "./http-client";
export type InventoryUnit="KG"|"G"|"L"|"ML"|"UNIT";
export type MovementType="ENTRY"|"EXIT"|"ADJUSTMENT";
export interface InventoryItem {id:string;name:string;category:string;unit:InventoryUnit;currentStock:number;minimumStock:number;unitCost:number;supplier:string|null;active:boolean;isLowStock:boolean;createdAt:string;updatedAt:string}
export interface InventoryMovement {id:string;type:MovementType;quantity:number;previousStock:number;resultingStock:number;note:string|null;createdAt:string;user:{id:string;name:string};item:{id:string;name:string;unit:InventoryUnit}}
export interface InventoryInput {name:string;category:string;unit:InventoryUnit;currentStock:number;minimumStock:number;unitCost:number;supplier:string|null}
export const inventoryService={
 list(params?:{q?:string;category?:string;lowStock?:boolean}){return apiRequest<{data:InventoryItem[];summary:{total:number;lowStock:number;totalValue:number;categories:number}}>({method:"GET",url:"/inventory",params});},
 create(data:InventoryInput){return apiRequest<InventoryItem>({method:"POST",url:"/inventory",data});},
 update(id:string,data:Partial<InventoryInput>&{active?:boolean}){return apiRequest<InventoryItem>({method:"PATCH",url:`/inventory/${id}`,data});},
 move(id:string,data:{type:MovementType;quantity:number;note:string|null}){return apiRequest<{item:InventoryItem;movement:InventoryMovement}>({method:"POST",url:`/inventory/${id}/movements`,data});},
 movements(itemId?:string){return apiRequest<{data:InventoryMovement[]}>({method:"GET",url:"/inventory/movements/history",params:{itemId,limit:100}});}
};
