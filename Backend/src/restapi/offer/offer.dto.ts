import { OfferDiscountType, OfferType } from 'src/db/schema';

export class CreateOfferDto {
  offer_name: string;
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
  usage_limit?: number | null;
  usage_count?: number;
  is_active?: boolean;
}

export class UpdateOfferDto {
  offer_name?: string;
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
  usage_limit?: number | null;
  usage_count?: number;
  is_active?: boolean;
  is_activate?: boolean;
}
