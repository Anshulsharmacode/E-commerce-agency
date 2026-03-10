import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EMPLOYEE = 'employee',
}

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, trim: true, index: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
    default: UserRole.USER,
    index: true,
  })
  role: UserRole;

  @Prop({ required: true, default: true, index: true })
  is_active: boolean;

  @Prop({ type: Object, required: false })
  address?: Record<string, unknown>;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'prodcut' }],
    default: [],
  })
  liked_product: Types.ObjectId[];

  created_at: Date;
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
