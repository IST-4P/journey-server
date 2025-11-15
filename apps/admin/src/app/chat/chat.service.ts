import { ChatProto } from '@hacmieu-journey/grpc';
import { NatsClient } from '@hacmieu-journey/nats';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);
  private chatService!: ChatProto.ChatServiceClient;

  constructor(
    @Inject(ChatProto.CHAT_PACKAGE_NAME)
    private client: ClientGrpc,
    private readonly natsClient: NatsClient
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

    try {
      const chatData = {
        id: chat.id,
        fromUserId: chat.fromUserId,
        toUserId: chat.toUserId,
        content: chat.content,
        createdAt: chat.createdAt,
      };

      // this.logger.log(
      //   `🚀 Publishing chat.created event: ${JSON.stringify(
      //     chatData
      //   )}`
      // );

      await this.natsClient.publish('journey.chats.chat-created', chatData);
    } catch (natsError) {
      // Log error but don't fail registration
      this.logger.error(`❌ Failed to publish chat.created event:`, natsError);
    }
    return chat;
  }

  getManyConversations(
    data: ChatProto.GetManyConversationsRequest
  ): Promise<ChatProto.GetManyConversationsResponse> {
    return lastValueFrom(this.chatService.getManyConversations(data));
  }

  updateComplaintStatus(
    data: ChatProto.UpdateComplaintStatusRequest
  ): Promise<ChatProto.GetComplaintResponse> {
    return lastValueFrom(this.chatService.updateComplaintStatus(data));
  }
}
