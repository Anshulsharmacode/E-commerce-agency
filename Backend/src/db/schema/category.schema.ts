import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  collection: 'categories',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Category {
  @Prop({ type: String, default: randomUUID, unique: true, index: true })
  category_id: string;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ required: false, trim: true })
  image_url?: string;

  @Prop({ type: String, required: false, index: true })
  parent_id?: string;

  @Prop({ required: true, default: true, index: true })
  is_active: boolean;

  @Prop({ required: false, min: 0, default: 0 })
  sort_order?: number;

  created_at: Date;
  updated_at: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
