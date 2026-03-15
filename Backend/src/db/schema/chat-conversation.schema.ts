import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from './user.schema';

export type ChatConversationDocument = HydratedDocument<ChatConversation>;

@Schema({ _id: false })
export class ConversationParticipant {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;
}

export const ConversationParticipantSchema = SchemaFactory.createForClass(
  ConversationParticipant,
);

@Schema({
  collection: 'chat_conversations',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class ChatConversation {
  @Prop({ type: String, required: true, unique: true, index: true })
  conversation_key: string;

  @Prop({
    type: [ConversationParticipantSchema],
    required: true,
    validate: {
      validator: (participants: ConversationParticipant[]) =>
        participants.length === 2,
      message: 'Conversation must have exactly 2 participants',
    },
  })
  participants: ConversationParticipant[];

  @Prop({ type: [String], required: true, index: true })
  participant_ids: string[];

  @Prop({ type: String, required: false })
  last_message?: string;

  @Prop({ type: Date, required: false, index: true })
  last_message_at?: Date;

  created_at: Date;
  updated_at: Date;
}

export const ChatConversationSchema =
  SchemaFactory.createForClass(ChatConversation);

ChatConversationSchema.index({ participant_ids: 1, last_message_at: -1 });
