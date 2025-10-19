import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ChatType,
  CreateChatRequestType,
  GetChatsRequestType,
  GetChatsResponseType,
} from './chat.model';
import { ChatService } from './chat.service';

@Controller()
export class ChatGrpcController {
  constructor(private readonly chatService: ChatService) {}

  @GrpcMethod('ChatService', 'GetChats')
  getChats(data: GetChatsRequestType): Promise<GetChatsResponseType> {
    return this.chatService.getChats(data);
  }

  @GrpcMethod('ChatService', 'CreateChat')
  createChat(data: CreateChatRequestType): Promise<ChatType> {
    return this.chatService.createChat(data);
  }
}
