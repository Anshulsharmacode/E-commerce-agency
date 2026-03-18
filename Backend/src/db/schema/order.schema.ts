import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Schema({
  collection: 'orders',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Order {
  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ type: [Object], required: true, default: [] })
  items: Record<string, unknown>[];

  @Prop({
    type: String,
    enum: OrderStatus,
    required: true,
    default: OrderStatus.PENDING,
    index: true,
  })
  status: OrderStatus;

  @Prop({ required: true, min: 0 })
  total_amount: number;

  @Prop({ required: true, min: 0, default: 0 })
  total_discount: number;

  @Prop({ required: true, min: 0 })
  final_amount: number;

  @Prop({ type: [Object], required: false, default: [] })
  applied_offers?: Record<string, unknown>[];

  @Prop({ type: Object, required: true })
  delivery_address: Record<string, unknown>;

  @Prop({ required: false, trim: true })
  notes?: string;

  @Prop({ required: false, trim: true })
  cancellation_reason?: string;

  @Prop({ required: false, trim: true })
  cancelled_by?: string;

  @Prop({ required: false, trim: true })
  created_by?: string;

  @Prop({ required: false })
  refer_to?: string;

  created_at: Date;
  updated_at: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
