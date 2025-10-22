import {
  CreateChatRequest,
  GetChatResponse,
  GetChatsRequest,
  GetChatsResponse,
} from '@domain/chat';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ChatService } from './chat.service';

@Controller()
export class ChatGrpcController {
  constructor(private readonly chatService: ChatService) {}

  @GrpcMethod('ChatService', 'GetChats')
  getChats(data: GetChatsRequest): Promise<GetChatsResponse> {
    return this.chatService.getChats(data);
  }

  @GrpcMethod('ChatService', 'CreateChat')
  createChat(data: CreateChatRequest): Promise<GetChatResponse> {
    return this.chatService.createChat(data);
  }
}
