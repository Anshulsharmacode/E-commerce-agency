import api from "./config";
import type { ApiResponse } from "./types";

// Types for Product
export type ProductUnit = "KG" | "LITRE" | "PIECE" | "BOX";

export interface Product {
  _id: string;

  category_id: string;
  name: string;
  description?: string;
  unit: ProductUnit;
  unit_weight: number;
  pieces_per_box: number;
  selling_price_box: number;
  purchase_price_box: number;
  image_urls?: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  category_id: string;
  name: string;
  description?: string;
  unit: ProductUnit;
  unit_weight: number;
  pieces_per_box: number;
  selling_price_box: number;
  purchase_price_box: number;
  image_urls?: string[];
  is_active?: boolean;
}

export interface UpdateProductData {
  category_id?: string;
  name?: string;
  description?: string;
  unit?: ProductUnit;
  unit_weight?: number;
  pieces_per_box?: number;
  selling_price_box?: number;
  purchase_price_box?: number;
  image_urls?: string[];
  is_active?: boolean;
}

export const getAllProducts = async (
  page: number = 1,
  limit: number = 50,
): Promise<ApiResponse<Product[]>> => {
  const params = { page, limit };
  const response = await api.get<ApiResponse<Product[]>>("/product/all", {
    params,
  });
  return response.data;
};

export const createProduct = async (
  data: CreateProductData,
): Promise<ApiResponse<Product>> => {
  const response = await api.post<ApiResponse<Product>>(
    "/product/create",
    data,
  );
  return response.data;
};

export const updateProduct = async (
  productId: string,
  data: UpdateProductData,
): Promise<ApiResponse<Product>> => {
  const response = await api.patch<ApiResponse<Product>>(
    `/product/${productId}`,
    data,
  );
  return response.data;
};

export const deleteProduct = async (
  productId: string,
): Promise<ApiResponse<Product>> => {
  const response = await api.delete<ApiResponse<Product>>(
    `/product/${productId}`,
  );
  return response.data;
};

export const getProductBy_id = async (
  product_id: string,
): Promise<ApiResponse<Product>> => {
  const response = await api.get<ApiResponse<Product>>(
    `/product/${product_id}`,
  );
  return response.data;
};
