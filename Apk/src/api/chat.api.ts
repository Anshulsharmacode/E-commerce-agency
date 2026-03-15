import api from './config';
import type { ApiResponse } from './types';

export type ChatRole = 'admin' | 'user' | 'employee';

export interface ChatConversation {
  conversation_id: string;
  participants: Array<{
    user_id: string;
    role: ChatRole;
  }>;
  participant_profiles: Array<{
    _id: string;
    name: string;
    email: string;
    role: ChatRole;
  }>;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: ChatRole;
  message_type: 'text';
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface SendChatMessageData {
  conversation_id?: string;
  recipient_id?: string;
  content: string;
  message_type?: 'text';
}

export interface SendChatMessageResult {
  conversation: ChatConversation;
  message: ChatMessage;
  participant_ids: string[];
}

export const getMyConversations = async (): Promise<
  ApiResponse<ChatConversation[]>
> => {
  const response =
    await api.get<ApiResponse<ChatConversation[]>>('/chat/conversations');
  return response.data;
};

export const getConversationMessages = async (
  conversationId: string,
  limit = 50,
  page = 1,
): Promise<ApiResponse<ChatMessage[]>> => {
  const response = await api.get<ApiResponse<ChatMessage[]>>(
    `/chat/conversations/${conversationId}/messages`,
    {
      params: { page, limit },
    },
  );
  return response.data;
};

export const sendChatMessage = async (
  data: SendChatMessageData,
): Promise<ApiResponse<SendChatMessageResult>> => {
  const response = await api.post<ApiResponse<SendChatMessageResult>>(
    '/chat/messages',
    data,
  );
  return response.data;
};
