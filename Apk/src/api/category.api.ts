import api from './config';
import type { ApiResponse } from './types';


// Types for Category
export interface Category {
  _id: string;
  category_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  is_active?: boolean;
}


export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await api.get<ApiResponse<Category[]>>('/category/all');
  return response.data;
};


export const getCategoryById = async (categoryId: string): Promise<ApiResponse<Category>> => {
  const response = await api.get<ApiResponse<Category>>(`/category/${categoryId}`);
  return response.data;
};


export const createCategory = async (data: CreateCategoryData): Promise<ApiResponse<Category>> => {
  const response = await api.post<ApiResponse<Category>>('/category/create', data);
  return response.data;
};


export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryData
): Promise<ApiResponse<Category>> => {
  const response = await api.patch<ApiResponse<Category>>(`/category/${categoryId}`, data);
  return response.data;
};


export const deleteCategory = async (categoryId: string): Promise<ApiResponse<Category>> => {
  const response = await api.delete<ApiResponse<Category>>(`/category/${categoryId}`);
  return response.data;
};
