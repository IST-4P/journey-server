import { CreateChatRequestDTO, GetChatsRequestDTO } from '@domain/chat';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  // private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get()
  getManyChats(@Query() query: GetChatsRequestDTO) {
    return this.chatService.getChats(query);
  }

  @Post()
  getChat(@Body() body: CreateChatRequestDTO) {
    return this.chatService.createChat(body);
  }
}
