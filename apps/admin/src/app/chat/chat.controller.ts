import { ChatProto } from '@hacmieu-journey/grpc';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateChatRequestDTO, GetChatsQueryDTO } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  // private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get()
  getManyChats(@Query() query: GetChatsQueryDTO) {
    return this.chatService.getChats(query as ChatProto.GetChatsRequest);
  }

  @Post()
  getChat(@Body() body: CreateChatRequestDTO) {
    return this.chatService.createChat(body as ChatProto.CreateChatRequest);
  }
}
