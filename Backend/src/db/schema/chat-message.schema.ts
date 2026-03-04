import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

export enum SenderRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum ChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  ORDER_LINK = 'order_link',
  FILE = 'file',
}

@Schema({
  collection: 'chat_messages',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class ChatMessage {
  @Prop({ type: String, default: randomUUID, unique: true, index: true })
  message_id: string;

  @Prop({ type: String, required: true, index: true })
  conversation_id: string;

  @Prop({ type: String, required: true, index: true })
  sender_id: string;

  @Prop({ type: String, enum: SenderRole, required: true })
  sender_role: SenderRole;

  @Prop({
    type: String,
    enum: ChatMessageType,
    required: true,
    default: ChatMessageType.TEXT,
  })
  message_type: ChatMessageType;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: false, index: true })
  is_read: boolean;

  @Prop({ type: Date, required: false })
  read_at?: Date;

  created_at: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
