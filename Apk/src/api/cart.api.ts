import api from './config';
import type { ApiResponse } from './types';

// Types for Cart
export interface CartItem {
  product_id: string;
  quantity_boxes: number;
  price_per_box: number;
  applied_offer_id?: string;
  total_price: number;
}

export interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
  total_discount: number;
  final_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface AddCartItemData {
  product_id: string;
  quantity_boxes: number;
  applied_offer_id?: string;
}

export interface UpdateCartItemData {
  quantity_boxes: number;
  applied_offer_id?: string;
}


export const getMyCart = async (): Promise<ApiResponse<Cart>> => {
  const response = await api.get<ApiResponse<Cart>>('/cart/my');
  return response.data;
};


export const addCartItem = async (data: AddCartItemData): Promise<ApiResponse<Cart>> => {
  const response = await api.post<ApiResponse<Cart>>('/cart/add-item', data);
  return response.data;
};


export const updateCartItem = async (
  productId: string,
  data: UpdateCartItemData
): Promise<ApiResponse<Cart>> => {
  const response = await api.patch<ApiResponse<Cart>>(`/cart/item/${productId}`, data);
  return response.data;
};

export const removeCartItem = async (productId: string): Promise<ApiResponse<Cart>> => {
  const response = await api.delete<ApiResponse<Cart>>(`/cart/item/${productId}`);
  return response.data;
};


export const clearCart = async (): Promise<ApiResponse<Cart>> => {
  const response = await api.delete<ApiResponse<Cart>>('/cart/clear');
  return response.data;
};
