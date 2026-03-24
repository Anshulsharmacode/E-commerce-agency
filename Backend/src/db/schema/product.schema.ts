import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductUnit {
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  ML = 'ml',
  PIECE = 'piece',
}

@Schema({
  collection: 'products',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {
  @Prop({ type: String, required: true, index: true })
  category_id: string;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ type: String, enum: ProductUnit, required: true })
  unit: ProductUnit;

  @Prop({ required: true, min: 0.001 })
  unit_weight: number;

  @Prop({ required: true, min: 1 })
  pieces_per_box: number;

  @Prop({ required: true, min: 0 })
  selling_price_box: number;

  @Prop({ required: true, min: 0 })
  purchase_price_box: number;

  // @Prop({ required: true, min: 0 })
  // purchase_price_piece: number;

  @Prop({ type: String, required: false, trim: true })
  image_url?: string;

  @Prop({ required: true, default: true, index: true })
  is_active: boolean;

  // @Prop({ required: false, min: 0, default: 0 })
  // stock_boxes?: number;

  created_at: Date;
  updated_at: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ProductSchema.virtual('selling_price_piece').get(function (this: Product) {
//   if (this.pieces_per_box) return 0;
//   return this.selling_price_box / this.pieces_per_box;
// });

// ProductSchema.virtual('margin_per_box').get(function (this: Product) {
//   return this.selling_price_box - this.purchase_price_box;
// });

// ProductSchema.virtual('stock_pieces').get(function (this: Product) {
//   return (this.stock_boxes ?? 0) * this.pieces_per_box;
// });
