import { generateRoomUserId } from '@hacmieu-journey/websocket';
import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createClient, RedisClientType } from 'redis';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';

@WebSocketGateway({ namespace: 'complaint-list' })
export class ComplaintListGateway implements OnGatewayConnection {
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

      await this.redisSubscriber.subscribe('complaint:complaintUpdated', () => {
        this.handleComplaintUpdatedFromRedis();
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

  private async handleComplaintUpdatedFromRedis() {
    try {
      // Lấy tất cả connected sockets và refresh conversations cho từng admin
      const sockets = await this.server.fetchSockets();

      for (const socket of sockets) {
        const complaints = await this.chatService.getManyComplaints({
          page: 1,
          limit: 15,
        });
        socket.emit('complaintsRefreshed', complaints);
      }
    } catch (error) {
      console.error('❌ Error handling complaintUpdated from Redis:', error);
    }
  }
}
