import { apiRequest } from "./http-client";

export interface OrderProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  favorite: boolean;
  category: {
    id: string;
    code: string;
    name: string;
  };
}

interface ProductsResponse {
  data: OrderProduct[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export const productsService = {
  list(query = ""): Promise<ProductsResponse> {
    return apiRequest<ProductsResponse>({
      method: "GET",
      url: "/products",
      params: { q: query || undefined, page: 1, pageSize: 100 }
    });
  }
};
