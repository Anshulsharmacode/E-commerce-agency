import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({
  collection: 'otps',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Otp {
  @Prop({ required: true, index: true })
  emailOrPhone: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true, index: { expires: '10m' } })
  expiry: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
