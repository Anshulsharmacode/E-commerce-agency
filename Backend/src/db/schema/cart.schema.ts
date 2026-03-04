import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: String, required: true, index: true })
  product_id: string;

  @Prop({ required: true, min: 1 })
  quantity_boxes: number;

  @Prop({ required: true, min: 0 })
  price_per_box: number;

  @Prop({ type: String, required: false })
  applied_offer_id?: string;

  @Prop({ required: true, min: 0 })
  total_price: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({
  collection: 'carts',
  timestamps: { createdAt: false, updatedAt: 'updated_at' },
})
export class Cart {
  @Prop({ type: String, default: randomUUID, unique: true, index: true })
  cart_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  user_id: string;

  @Prop({ type: [CartItemSchema], required: true, default: [] })
  items: CartItem[];

  @Prop({ required: true, min: 0, default: 0 })
  total_amount: number;

  @Prop({ required: true, min: 0, default: 0 })
  total_discount: number;

  @Prop({ required: true, min: 0, default: 0 })
  final_amount: number;

  updated_at: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
