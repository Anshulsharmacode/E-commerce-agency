import { ChatMessageType } from 'src/db/schema/chat-message.schema';

export class SendChatMessageDto {
  conversation_id?: string;
  recipient_id?: string;
  content: string;
  message_type?: ChatMessageType;
}

export class ConversationMessagesQueryDto {
  page?: string | number;
  limit?: string | number;
}
