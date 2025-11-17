import { CreateChatRequestDTO } from '@domain/chat';
import { generateRoomUserId } from '@hacmieu-journey/websocket';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createClient, RedisClientType } from 'redis';
import { Namespace, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection {
  private redisPublisher?: RedisClientType;

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService
  ) {
    this.initRedis();
  }

  @WebSocketServer()
  server!: Namespace;

  private async initRedis() {
    try {
      const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');
      if (!redisUrl) {
        console.warn('⚠️  REDIS_URL not configured for ChatGateway');
        return;
      }

      this.redisPublisher = createClient({ url: redisUrl });
      await this.redisPublisher.connect();
    } catch (error) {
      console.error('❌ Failed to connect Redis publisher:', error);
    }
  }

  handleConnection(client: Socket) {
    const userId = client.data['userId'];
    if (userId) {
      const room = generateRoomUserId(userId);
      client.join(room);
    }
  }

  @SubscribeMessage('sendChat')
  async handleEvent(
    @MessageBody() message: CreateChatRequestDTO,
    @ConnectedSocket() client: Socket
  ) {
    const fromUserId = client.data['userId'];
    const newMessage = await this.chatService.createChat({
      ...message,
      fromUserId,
    });
    const recipientRoom = generateRoomUserId(message.toUserId);
    this.server.to(recipientRoom).emit('newChat', newMessage);

    // Gửi lại tin nhắn cho chính người gửi để cập nhật UI của họ.
    client.emit('newChat', newMessage);

    // Broadcast qua Redis để notify admin app
    if (this.redisPublisher) {
      try {
        await this.redisPublisher.publish('chat:conversationUpdated', '');
      } catch (error) {
        console.error('❌ Error publishing to Redis:', error);
      }
    }
  }
}
