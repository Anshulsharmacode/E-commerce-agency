import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { AuthUser } from 'src/common/types/types';
import { ConversationMessagesQueryDto, SendChatMessageDto } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async conversations(@Req() req: Request & { user?: AuthUser }) {
    const userId = req.user?._id ?? '';
    const conversations = await this.chatService.listConversations(userId);

    return {
      message: 'Conversations fetched successfully',
      data: conversations,
    };
  }

  @Get('conversations/:conversationId/messages')
  async conversationMessages(
    @Req() req: Request & { user?: AuthUser },
    @Param('conversationId') conversationId: string,
    @Query() query: ConversationMessagesQueryDto,
  ) {
    const userId = req.user?._id ?? '';
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 30);

    const messages = await this.chatService.getConversationMessages(
      userId,
      conversationId,
      page,
      limit,
    );

    return {
      message: 'Messages fetched successfully',
      data: messages,
    };
  }

  @Post('messages')
  async sendMessage(
    @Req() req: Request & { user?: AuthUser },
    @Body() body: SendChatMessageDto,
  ) {
    const senderId = req.user?._id ?? '';
    const senderRole = req.user?.role;

    if (!senderRole) {
      throw new UnauthorizedException('Sender role is missing from auth token');
    }

    const result = await this.chatService.sendMessage(
      { _id: senderId, role: senderRole },
      body,
    );

    return {
      message: 'Message sent successfully',
      data: result,
    };
  }
}
