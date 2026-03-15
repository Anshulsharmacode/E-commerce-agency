import api from "./config";
import type { ApiResponse } from "./types";

// Types for Order
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  product_id: string;
  quantity_boxes: number;
  price_per_box: number;
  applied_offer_id?: string;
  total_price: number;
}

export interface Order {
  _id: string;

  user_id: string;
  items: OrderItem[];
  status: OrderStatus;
  total_amount: number;
  total_discount: number;
  final_amount: number;
  applied_offers?: {
    offer_id: string;
    product_id: string;
  }[];
  delivery_address: Record<string, unknown>;
  notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderData {
  delivery_address: Record<string, unknown>;
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  notes?: string;
}

export interface CancelOrderData {
  cancellation_reason: string;
}

export const createOrder = async (
  data: CreateOrderData,
): Promise<ApiResponse<Order>> => {
  const response = await api.post<ApiResponse<Order>>("/order/create", data);
  return response.data;
};

export const getMyOrders = async (): Promise<ApiResponse<Order[]>> => {
  const response = await api.get<ApiResponse<Order[]>>("/order/my");
  return response.data;
};

export const getMyOrderById = async (
  orderId: string,
): Promise<ApiResponse<Order>> => {
  const response = await api.get<ApiResponse<Order>>(`/order/my/${orderId}`);
  return response.data;
};

export const cancelMyOrder = async (
  orderId: string,
  data: CancelOrderData,
): Promise<ApiResponse<Order>> => {
  const response = await api.patch<ApiResponse<Order>>(
    `/order/my/${orderId}/cancel`,
    data,
  );
  return response.data;
};

export const getAllOrders = async (): Promise<ApiResponse<Order[]>> => {
  const response = await api.get<ApiResponse<Order[]>>("/order/all");
  return response.data;
};

export const getOrderById = async (
  orderId: string,
): Promise<ApiResponse<Order>> => {
  const response = await api.get<ApiResponse<Order>>(`/order/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (
  orderId: string,
  data: UpdateOrderStatusData,
): Promise<ApiResponse<Order>> => {
  const response = await api.patch<ApiResponse<Order>>(
    `/order/${orderId}/status`,
    data,
  );
  return response.data;
};
