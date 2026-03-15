import api from "./config";
import type { ApiResponse } from "./types";

// Types for Offer
export type OfferType = "PRODUCT" | "CATEGORY" | "BXGY" | "TARGET" | "GLOBAL";
export type OfferDiscountType = "PERCENTAGE" | "FIXED" | "FREE_PRODUCT";

export interface Offer {
  _id: string;

  offer_name: string;
  offer_code: string;
  offer_type: OfferType;
  discount_type: OfferDiscountType;
  discount_value: number;
  min_order_value?: number;
  min_order_boxes?: number;
  applicable_product_ids?: string[];
  applicable_category_ids?: string[];
  buy_quantity?: number;
  free_quantity?: number;
  free_product_id?: string;
  target_boxes?: number;
  reward_amount?: number;
  start_date: Date;
  end_date: Date;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOfferData {
  offer_name: string;
  offer_code: string;
  offer_type: OfferType;
  discount_type: OfferDiscountType;
  discount_value: number;
  min_order_value?: number;
  min_order_boxes?: number;
  applicable_product_ids?: string[];
  applicable_category_ids?: string[];
  buy_quantity?: number;
  free_quantity?: number;
  free_product_id?: string;
  target_boxes?: number;
  reward_amount?: number;
  start_date: Date;
  end_date: Date;
  usage_limit?: number;
  usage_count?: number;
  is_active?: boolean;
}

export interface UpdateOfferData {
  offer_name?: string;
  offer_code?: string;
  offer_type?: OfferType;
  discount_type?: OfferDiscountType;
  discount_value?: number;
  min_order_value?: number;
  min_order_boxes?: number;
  applicable_product_ids?: string[];
  applicable_category_ids?: string[];
  buy_quantity?: number;
  free_quantity?: number;
  free_product_id?: string;
  target_boxes?: number;
  reward_amount?: number;
  start_date?: Date;
  end_date?: Date;
  usage_limit?: number;
  usage_count?: number;
  is_active?: boolean;
}

export const getAllOffers = async (): Promise<ApiResponse<Offer[]>> => {
  const response = await api.get<ApiResponse<Offer[]>>("/offer/all");
  return response.data;
};

/**
 * Get active offers only
 */
export const getActiveOffers = async (): Promise<ApiResponse<Offer[]>> => {
  const response = await api.get<ApiResponse<Offer[]>>("/offer/active");
  return response.data;
};

/**
 * Get a single offer by ID
 * @param offerId - ID of the offer
 */
export const getOfferById = async (
  offerId: string,
): Promise<ApiResponse<Offer>> => {
  const response = await api.get<ApiResponse<Offer>>(`/offer/${offerId}`);
  return response.data;
};

export const createOffer = async (
  data: CreateOfferData,
): Promise<ApiResponse<Offer>> => {
  const response = await api.post<ApiResponse<Offer>>("/offer/create", data);
  return response.data;
};

export const updateOffer = async (
  offerId: string,
  data: UpdateOfferData,
): Promise<ApiResponse<Offer>> => {
  const response = await api.patch<ApiResponse<Offer>>(
    `/offer/${offerId}`,
    data,
  );
  return response.data;
};

export const deleteOffer = async (
  offerId: string,
): Promise<ApiResponse<Offer>> => {
  const response = await api.delete<ApiResponse<Offer>>(`/offer/${offerId}`);
  return response.data;
};
