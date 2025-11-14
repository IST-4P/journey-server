import {
  CreateChatRequestDTO,
  GetChatsRequestDTO,
  GetManyConversationsRequestDTO,
} from '@domain/chat';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  // private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getManyConversations(
    @Query() query: Omit<GetManyConversationsRequestDTO, 'adminId'>,
    @ActiveUser('userId') adminId: string
  ) {
    return this.chatService.getManyConversations({ ...query, adminId });
  }

  @Get()
  getManyChats(
    @Query() query: GetChatsRequestDTO,
    @ActiveUser('userId') adminId: string
  ) {
    return this.chatService.getChats({ ...query, fromUserId: adminId });
  }

  @Post()
  getChat(@Body() body: CreateChatRequestDTO) {
    return this.chatService.createChat(body);
  }
}
