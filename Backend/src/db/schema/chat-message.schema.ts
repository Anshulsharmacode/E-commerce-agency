import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from './user.schema';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

export enum ChatMessageType {
  TEXT = 'text',
  // IMAGE = 'image'

  // FILE = 'file',
}

@Schema({
  collection: 'chat_messages',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class ChatMessage {
  @Prop({ type: String, required: true, index: true })
  conversation_id: string;

  @Prop({ type: String, required: true, index: true })
  sender_id: string;

  @Prop({ type: String, enum: UserRole, required: true })
  sender_role: UserRole;

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
