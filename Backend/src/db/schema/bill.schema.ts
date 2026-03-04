import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type BillDocument = HydratedDocument<Bill>;

export enum PaymentMethod {
  CASH = 'cash',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  CREDIT = 'credit',
  COD = 'cod',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class PaymentTransaction {
  @Prop({ type: String, default: randomUUID })
  transaction_id: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: Date, required: true, default: () => new Date() })
  paid_at: Date;

  @Prop({ required: false, trim: true })
  reference?: string;

  @Prop({ required: false, trim: true })
  note?: string;
}

const PaymentTransactionSchema =
  SchemaFactory.createForClass(PaymentTransaction);

@Schema({
  collection: 'bills',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Bill {
  @Prop({ type: String, default: randomUUID, unique: true, index: true })
  bill_id: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  order_id: string;

  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ required: true, unique: true, index: true })
  bill_number: string;

  @Prop({ type: [Object], required: true, default: [] })
  items_snapshot: Record<string, unknown>[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount_amount: number;

  @Prop({ required: false, min: 0, default: 0 })
  tax_amount?: number;

  @Prop({ required: true, min: 0 })
  final_amount: number;

  @Prop({ type: String, enum: PaymentMethod, required: true, index: true })
  payment_method: PaymentMethod;

  @Prop({
    type: String,
    enum: PaymentStatus,
    required: true,
    default: PaymentStatus.PENDING,
    index: true,
  })
  payment_status: PaymentStatus;

  @Prop({ required: true, min: 0, default: 0 })
  amount_paid: number;

  @Prop({ required: true, min: 0, default: 0 })
  amount_due: number;

  @Prop({ type: Date, required: false, index: true })
  due_date?: Date;

  @Prop({ required: false, trim: true })
  payment_reference?: string;

  @Prop({ required: false, trim: true })
  notes?: string;

  @Prop({ required: false, trim: true })
  pdf_url?: string;

  @Prop({ type: [PaymentTransactionSchema], required: false, default: [] })
  transactions?: PaymentTransaction[];

  created_at: Date;
  updated_at: Date;
}

export const BillSchema = SchemaFactory.createForClass(Bill);

BillSchema.pre('validate', function () {
  const computedDue = Math.max(
    (this.final_amount ?? 0) - (this.amount_paid ?? 0),
    0,
  );
  this.amount_due = computedDue;

  if (this.amount_paid <= 0) {
    this.payment_status = PaymentStatus.PENDING;
  } else if (this.amount_paid < this.final_amount) {
    this.payment_status = PaymentStatus.PARTIAL;
  } else if (this.amount_paid >= this.final_amount) {
    this.payment_status = PaymentStatus.PAID;
  }
});
