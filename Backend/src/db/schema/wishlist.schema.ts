import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WishlistDocument = HydratedDocument<Wishlist>;

@Schema({
  collection: 'wishlists',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Wishlist {
  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ type: String, required: true, index: true })
  product_id: string;

  created_at: Date;
  updated_at: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });
