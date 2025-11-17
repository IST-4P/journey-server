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
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';

@WebSocketGateway({ namespace: 'chat-list' })
export class ChatListGateway implements OnGatewayConnection {
  private redisSubscriber?: RedisClientType;

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService
  ) {
    this.initRedis();
  }

  @WebSocketServer()
  server!: Server;

  private async initRedis() {
    try {
      const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');
      if (!redisUrl) {
        console.warn('⚠️  REDIS_URL not configured for ChatListGateway');
        return;
      }

      this.redisSubscriber = createClient({ url: redisUrl });
      await this.redisSubscriber.connect();

      await this.redisSubscriber.subscribe('chat:conversationUpdated', () => {
        this.handleConversationUpdatedFromRedis();
      });
    } catch (error) {
      console.error('❌ Failed to connect Redis subscriber:', error);
    }
  }

  handleConnection(client: Socket) {
    const userId = client.data['userId'];
    if (userId) {
      const room = generateRoomUserId(userId);
      client.join(room);
    }
  }

  private async handleConversationUpdatedFromRedis() {
    try {
      // Lấy tất cả connected sockets và refresh conversations cho từng admin
      const sockets = await this.server.fetchSockets();

      for (const socket of sockets) {
        const adminId = socket.data['userId'];
        if (adminId) {
          const conversations = await this.chatService.getManyConversations({
            adminId,
            page: 1,
            limit: 50,
          });
          socket.emit('conversationsRefreshed', conversations);
        }
      }
    } catch (error) {
      console.error('❌ Error handling conversationUpdated from Redis:', error);
    }
  }

  @SubscribeMessage('getConversations')
  async handleGetConversations(
    @MessageBody() data: { page?: number; limit?: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const adminId = client.data['userId'];

      const conversations = await this.chatService.getManyConversations({
        adminId,
        page: data.page || 1,
        limit: data.limit || 50,
      });
      client.emit('conversationsRefreshed', conversations);
    } catch (error) {
      console.error('❌ Error getting conversations:', error);
      client.emit('error', { message: 'Failed to get conversations' });
    }
  }
}
