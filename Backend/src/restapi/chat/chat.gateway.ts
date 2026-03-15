import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserRole } from 'src/db/schema';
import { ConversationMessagesQueryDto, SendChatMessageDto } from './chat.dto';
import { ChatService } from './chat.service';

type SocketAuthUser = {
  _id: string;
  role: UserRole;
};

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authenticate(client);
      client.data.user = user;
      client.join(this.userRoom(user._id));
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(): void {}

  @SubscribeMessage('conversation:list')
  async conversationList(@ConnectedSocket() client: Socket) {
    const user = this.getSocketUser(client);
    const conversations = await this.chatService.listConversations(user._id);
    return {
      ok: true,
      data: conversations,
    };
  }

  @SubscribeMessage('conversation:messages')
  async conversationMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversation_id: string;
      page?: number | string;
      limit?: number | string;
    },
  ) {
    const user = this.getSocketUser(client);
    const query: ConversationMessagesQueryDto = {
      page: payload.page,
      limit: payload.limit,
    };

    const messages = await this.chatService.getConversationMessages(
      user._id,
      payload.conversation_id,
      Number(query.page ?? 1),
      Number(query.limit ?? 30),
    );

    return {
      ok: true,
      data: messages,
    };
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendChatMessageDto,
  ) {
    const user = this.getSocketUser(client);

    const result = await this.chatService.sendMessage(
      { _id: user._id, role: user.role },
      payload,
    );

    for (const participantId of result.participant_ids) {
      this.server
        .to(this.userRoom(participantId))
        .emit('conversation:updated', {
          conversation: result.conversation,
        });

      this.server.to(this.userRoom(participantId)).emit('message:new', {
        message: result.message,
      });
    }

    return {
      ok: true,
      data: result,
    };
  }

  private getSocketUser(client: Socket): SocketAuthUser {
    const socketUser = client.data.user as SocketAuthUser | undefined;
    if (!socketUser?._id || !socketUser?.role) {
      throw new WsException('Unauthorized');
    }

    return socketUser;
  }

  private async authenticate(client: Socket): Promise<SocketAuthUser> {
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Token missing');
    }

    const payload = await this.jwtService.verifyAsync<{
      _id: string;
      role: UserRole;
    }>(token);

    if (!payload?._id || !payload?.role) {
      throw new WsException('Invalid token payload');
    }

    if (!Object.values(UserRole).includes(payload.role)) {
      throw new WsException('Invalid user role');
    }

    return {
      _id: String(payload._id),
      role: payload.role,
    };
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.replace(/^Bearer\s+/i, '').trim();
    }

    const headerToken = client.handshake.headers.authorization;
    if (typeof headerToken === 'string' && headerToken.trim()) {
      return headerToken.replace(/^Bearer\s+/i, '').trim();
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim()) {
      return queryToken.replace(/^Bearer\s+/i, '').trim();
    }

    return null;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
