import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type OfferDocument = HydratedDocument<Offer>;

export enum OfferType {
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  TARGET = 'TARGET',
  BXGY = 'BXGY',
}

export enum OfferDiscountType {
  FLAT = 'flat',
  PERCENTAGE = 'percentage',
  FREE_PRODUCT = 'free_product',
}

@Schema({
  collection: 'offers',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Offer {
  @Prop({ type: String, default: randomUUID, unique: true, index: true })
  offer_id: string;

  @Prop({ required: true, trim: true })
  offer_name: string;

  @Prop({ type: String, enum: OfferType, required: true, index: true })
  offer_type: OfferType;

  @Prop({ type: String, enum: OfferDiscountType, required: true })
  discount_type: OfferDiscountType;

  @Prop({ required: true, min: 0 })
  discount_value: number;

  @Prop({ required: false, min: 0 })
  min_order_value?: number;

  @Prop({ required: false, min: 0 })
  min_order_boxes?: number;

  @Prop({ type: [String], required: false, default: [] })
  applicable_product_ids?: string[];

  @Prop({ type: [String], required: false, default: [] })
  applicable_category_ids?: string[];

  @Prop({ required: false, min: 0 })
  buy_quantity?: number;

  @Prop({ required: false, min: 0 })
  free_quantity?: number;

  @Prop({ type: String, required: false })
  free_product_id?: string;

  @Prop({ required: false, min: 0 })
  target_boxes?: number;

  @Prop({ required: false, min: 0 })
  reward_amount?: number;

  @Prop({ required: true, type: Date, index: true })
  start_date: Date;

  @Prop({ required: true, type: Date, index: true })
  end_date: Date;

  @Prop({ required: false, min: 0 })
  usage_limit?: number;

  @Prop({ required: true, min: 0, default: 0 })
  usage_count: number;

  @Prop({ required: true, default: true, index: true })
  is_active: boolean;

  created_at: Date;
  updated_at: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
