import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'node:crypto';

export type ChatConversationDocument = HydratedDocument<ChatConversation>;

export enum ConversationStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  ARCHIVED = 'archived',
}

@Schema({
  collection: 'chat_conversations',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class ChatConversation {
  @Prop({ type: String, default: randomUUID, unique: true, index: true })
  conversation_id: string;

  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ type: String, required: false, index: true })
  admin_id?: string;

  @Prop({
    type: String,
    enum: ConversationStatus,
    required: true,
    default: ConversationStatus.OPEN,
    index: true,
  })
  status: ConversationStatus;

  created_at: Date;
  updated_at: Date;
}

export const ChatConversationSchema =
  SchemaFactory.createForClass(ChatConversation);
