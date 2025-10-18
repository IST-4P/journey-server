import { ChatProto } from '@hacmieu-journey/grpc';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Controller, Get, Query } from '@nestjs/common';
import { GetChatsRequestDTO } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  // private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get()
  getManyChats(
    @ActiveUser('userId') userId: string,
    @Query() query: GetChatsRequestDTO
  ) {
    return this.chatService.getChats({
      ...query,
      fromUserId: userId,
    } as ChatProto.GetChatsRequest);
  }
}
