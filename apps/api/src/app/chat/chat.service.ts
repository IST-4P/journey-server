import { ChatProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService implements OnModuleInit {
  private chatService!: ChatProto.ChatServiceClient;

  constructor(
    @Inject(ChatProto.CHAT_PACKAGE_NAME)
    private client: ClientGrpc,
    private readonly chatGateway: ChatGateway
  ) {}

  onModuleInit() {
    this.chatService = this.client.getService<ChatProto.ChatServiceClient>(
      ChatProto.CHAT_SERVICE_NAME
    );
  }

  getChats(
    data: ChatProto.GetChatsRequest
  ): Promise<ChatProto.GetChatsResponse> {
    return lastValueFrom(this.chatService.getChats(data));
  }

  async createChat(
    data: ChatProto.CreateChatRequest
  ): Promise<ChatProto.CreateChatResponse> {
    const chat = await lastValueFrom(this.chatService.createChat(data));
    this.chatGateway.handleChatCreated(chat);
    return chat;
  }
}
