import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatConversation,
  ChatConversationDocument,
  ChatMessage,
  ChatMessageDocument,
  ChatMessageType,
  User,
  UserDocument,
  UserRole,
} from 'src/db/schema';
import { SendChatMessageDto } from './chat.dto';

type ChatActor = {
  _id: string;
  role: UserRole;
};

type ChatUserLite = {
  _id: string;
  role: UserRole;
  name: string;
  email: string;
  is_active: boolean;
};

export type ChatMessagePayload = {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: UserRole;
  message_type: ChatMessageType;
  content: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
};

export type ChatConversationPayload = {
  conversation_id: string;
  participants: Array<{ user_id: string; role: UserRole }>;
  participant_profiles: Array<{
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  }>;
  last_message?: string;
  last_message_at?: Date;
  created_at: Date;
  updated_at: Date;
};

export type SendMessageResult = {
  conversation: ChatConversationPayload;
  message: ChatMessagePayload;
  participant_ids: string[];
};

const CHAT_RULES: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]: [UserRole.USER, UserRole.EMPLOYEE],
  [UserRole.USER]: [UserRole.ADMIN],
  [UserRole.EMPLOYEE]: [UserRole.ADMIN],
};

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ChatConversation.name)
    private readonly conversationModel: Model<ChatConversationDocument>,
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,
  ) {}

  async listConversations(userId: string): Promise<ChatConversationPayload[]> {
    const conversations = await this.conversationModel
      .find({ participant_ids: userId })
      .sort({ last_message_at: -1, updated_at: -1 })
      .lean();

    if (conversations.length === 0) {
      return [];
    }

    const participantIds = Array.from(
      new Set(conversations.flatMap((conversation) => conversation.participant_ids)),
    );
    const userMap = await this.getUserMap(participantIds);

    return conversations.map((conversation) =>
      this.toConversationPayload(conversation, userMap),
    );
  }

  async getConversationMessages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 30,
  ): Promise<ChatMessagePayload[]> {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : 30;

    await this.getConversationForUser(userId, conversationId);

    await this.messageModel.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        is_read: false,
      },
      {
        $set: {
          is_read: true,
          read_at: new Date(),
        },
      },
    );

    const messages = await this.messageModel
      .find({ conversation_id: conversationId })
      .sort({ created_at: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();

    return messages.reverse().map((message) => this.toMessagePayload(message));
  }

  async sendMessage(
    actor: ChatActor,
    payload: SendChatMessageDto,
  ): Promise<SendMessageResult> {
    const sender = await this.getActiveUser(actor._id);
    if (sender.role !== actor.role) {
      throw new ForbiddenException('Sender role mismatch');
    }

    if (payload.conversation_id) {
      return this.sendToExistingConversation(sender, payload);
    }

    const recipient = await this.resolveRecipient(sender, payload.recipient_id);
    this.assertChatAllowed(sender.role, recipient.role);

    const conversation = await this.getOrCreateConversation(sender, recipient);
    return this.persistMessage(conversation, sender, payload);
  }

  async getConversationForUserPayload(
    userId: string,
    conversationId: string,
  ): Promise<ChatConversationPayload> {
    const conversation = await this.getConversationForUser(userId, conversationId);
    const userMap = await this.getUserMap(conversation.participant_ids);
    return this.toConversationPayload(conversation.toObject(), userMap);
  }

  private async sendToExistingConversation(
    sender: ChatUserLite,
    payload: SendChatMessageDto,
  ): Promise<SendMessageResult> {
    const conversationId = payload.conversation_id;
    if (!conversationId) {
      throw new BadRequestException('conversation_id is required');
    }

    const conversation = await this.getConversationForUser(sender._id, conversationId);

    const recipientParticipant = conversation.participants.find(
      (participant) => participant.user_id !== sender._id,
    );

    if (!recipientParticipant) {
      throw new BadRequestException('Recipient not found in conversation');
    }

    this.assertChatAllowed(sender.role, recipientParticipant.role);

    return this.persistMessage(conversation, sender, payload);
  }

  private async resolveRecipient(
    sender: ChatUserLite,
    recipientId?: string,
  ): Promise<ChatUserLite> {
    if (recipientId) {
      if (recipientId === sender._id) {
        throw new BadRequestException('You cannot chat with yourself');
      }

      return this.getActiveUser(recipientId);
    }

    if (sender.role === UserRole.ADMIN) {
      throw new BadRequestException(
        'recipient_id is required when sender role is admin',
      );
    }

    const admin = await this.userModel
      .findOne({ role: UserRole.ADMIN, is_active: true })
      .sort({ created_at: 1 })
      .select('_id role name email is_active')
      .lean<ChatUserLite | null>();

    if (!admin) {
      throw new NotFoundException('No active admin available for chat');
    }

    return {
      _id: String(admin._id),
      role: admin.role,
      name: admin.name,
      email: admin.email,
      is_active: admin.is_active,
    };
  }

  private async persistMessage(
    conversation: ChatConversationDocument,
    sender: ChatUserLite,
    payload: SendChatMessageDto,
  ): Promise<SendMessageResult> {
    const content = payload.content?.trim();
    if (!content) {
      throw new BadRequestException('Message content is required');
    }

    const messageType = payload.message_type ?? ChatMessageType.TEXT;
    const message = await this.messageModel.create({
      conversation_id: String(conversation._id),
      sender_id: sender._id,
      sender_role: sender.role,
      message_type: messageType,
      content: content,
      is_read: false,
    });

    await this.conversationModel.findByIdAndUpdate(conversation._id, {
      $set: {
        last_message: content,
        last_message_at: message.created_at ?? new Date(),
      },
    });

    const updatedConversation = await this.conversationModel.findById(
      conversation._id,
    );

    if (!updatedConversation) {
      throw new NotFoundException('Conversation not found');
    }

    const userMap = await this.getUserMap(updatedConversation.participant_ids);

    return {
      conversation: this.toConversationPayload(updatedConversation.toObject(), userMap),
      message: this.toMessagePayload(message.toObject()),
      participant_ids: updatedConversation.participant_ids,
    };
  }

  private async getOrCreateConversation(
    sender: ChatUserLite,
    recipient: ChatUserLite,
  ): Promise<ChatConversationDocument> {
    const conversationKey = this.buildConversationKey(sender._id, recipient._id);
    const sortedParticipantIds = [sender._id, recipient._id].sort();

    const created = await this.conversationModel.findOneAndUpdate(
      { conversation_key: conversationKey },
      {
        $setOnInsert: {
          conversation_key: conversationKey,
          participants: [
            { user_id: sender._id, role: sender.role },
            { user_id: recipient._id, role: recipient.role },
          ],
          participant_ids: sortedParticipantIds,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return created;
  }

  private async getConversationForUser(
    userId: string,
    conversationId: string,
  ): Promise<ChatConversationDocument> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participant_ids.includes(userId)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return conversation;
  }

  private async getActiveUser(userId: string): Promise<ChatUserLite> {
    const user = await this.userModel
      .findById(userId)
      .select('_id role name email is_active')
      .lean<ChatUserLite | null>();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.is_active) {
      throw new ForbiddenException('User account is inactive');
    }

    return {
      _id: String(user._id),
      role: user.role,
      name: user.name,
      email: user.email,
      is_active: user.is_active,
    };
  }

  private assertChatAllowed(senderRole: UserRole, recipientRole: UserRole): void {
    const allowedRecipients = CHAT_RULES[senderRole] ?? [];

    if (!allowedRecipients.includes(recipientRole)) {
      throw new ForbiddenException(
        `Role ${senderRole} cannot send messages to role ${recipientRole}`,
      );
    }
  }

  private buildConversationKey(userIdA: string, userIdB: string): string {
    return [userIdA, userIdB].sort().join('::');
  }

  private async getUserMap(
    userIds: string[],
  ): Promise<Map<string, { _id: string; name: string; email: string; role: UserRole }>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('_id name email role')
      .lean<Array<{ _id: string; name: string; email: string; role: UserRole }>>();

    return new Map(
      users.map((user) => [
        String(user._id),
        {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      ]),
    );
  }

  private toConversationPayload(
    conversation: ChatConversation & { _id: unknown },
    userMap: Map<string, { _id: string; name: string; email: string; role: UserRole }>,
  ): ChatConversationPayload {
    return {
      conversation_id: String(conversation._id),
      participants: conversation.participants,
      participant_profiles: conversation.participant_ids
        .map((participantId) => userMap.get(participantId))
        .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile)),
      last_message: conversation.last_message,
      last_message_at: conversation.last_message_at,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
    };
  }

  private toMessagePayload(
    message: ChatMessage & { _id: unknown },
  ): ChatMessagePayload {
    return {
      message_id: String(message._id),
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      sender_role: message.sender_role,
      message_type: message.message_type,
      content: message.content,
      is_read: message.is_read,
      read_at: message.read_at,
      created_at: message.created_at,
    };
  }
}
