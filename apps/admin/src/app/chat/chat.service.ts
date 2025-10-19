import { ChatProto } from '@hacmieu-journey/grpc';
import { PulsarClient } from '@hacmieu-journey/pulsar';
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
    private readonly pulsarClient: PulsarClient
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
      const producer = await this.pulsarClient.createProducer(
        'persistent://journey/chats/chat-created'
      );

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

      await producer.send({
        data: Buffer.from(JSON.stringify(chatData)),
        properties: {
          eventType: 'chat.created',
          version: '1.0',
          source: 'admin-service',
        },
        eventTimestamp: Date.now(),
      });
    } catch (pulsarError) {
      // Log error but don't fail registration
      this.logger.error(
        `❌ Failed to publish user-registered event:`,
        pulsarError
      );
    }
    return chat;
  }
}
