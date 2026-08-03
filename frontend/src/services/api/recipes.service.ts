import { apiRequest } from "./http-client";
import type { InventoryUnit } from "./inventory.service";

export interface RecipeCategory {
  id: string;
  code: string;
  name: string;
}

export interface RecipeProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  category: RecipeCategory;
}

export interface RecipeInventoryItem {
  id: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  active: boolean;
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  inventoryItemId: string;
  quantity: number;
  wastePercent: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  inventoryItem: RecipeInventoryItem;
}

export interface Recipe {
  id: string;
  companyId: string;
  productId: string;
  name: string;
  yieldQuantity: number;
  yieldUnit: InventoryUnit;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  product: RecipeProduct;
  items: RecipeItem[];
}

export interface RecipeItemInput {
  inventoryItemId: string;
  quantity: number;
  wastePercent?: number;
  sortOrder?: number;
}

export interface CreateRecipeInput {
  productId: string;
  name: string;
  yieldQuantity: number;
  yieldUnit: InventoryUnit;
  notes?: string | null;
  active?: boolean;
  items: RecipeItemInput[];
}

export interface UpdateRecipeInput {
  productId?: string;
  name?: string;
  yieldQuantity?: number;
  yieldUnit?: InventoryUnit;
  notes?: string | null;
  active?: boolean;
  items?: RecipeItemInput[];
}

export interface RecipeListParams {
  q?: string;
  productId?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

export interface RecipePagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface RecipeListResponse {
  data: Recipe[];
  pagination: RecipePagination;
}

export const recipesService = {
  list(params?: RecipeListParams) {
    return apiRequest<RecipeListResponse>({
      method: "GET",
      url: "/recipes",
      params,
    });
  },

  get(id: string) {
    return apiRequest<Recipe>({
      method: "GET",
      url: `/recipes/${id}`,
    });
  },

  create(data: CreateRecipeInput) {
    return apiRequest<Recipe>({
      method: "POST",
      url: "/recipes",
      data,
    });
  },

  update(id: string, data: UpdateRecipeInput) {
    return apiRequest<Recipe>({
      method: "PATCH",
      url: `/recipes/${id}`,
      data,
    });
  },

  remove(id: string) {
    return apiRequest<void>({
      method: "DELETE",
      url: `/recipes/${id}`,
    });
  },
};
