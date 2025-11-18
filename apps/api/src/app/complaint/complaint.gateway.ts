import { CreateComplaintMessageRequestDTO } from '@domain/chat';
import { generateRoomComplaintId } from '@hacmieu-journey/websocket';
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
import { ComplaintService } from './complaint.service';

@WebSocketGateway({ namespace: 'complaint' })
export class ComplaintGateway implements OnGatewayConnection {
  private redisPublisher?: RedisClientType;

  constructor(
    private readonly complaintService: ComplaintService,
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
    const complaintId = client.handshake.query.complaintId;
    if (complaintId) {
      const room = generateRoomComplaintId(complaintId as string);
      client.join(room);
    }
  }

  @SubscribeMessage('sendComplaintMessage')
  async handleSendMessage(
    @MessageBody() message: Omit<CreateComplaintMessageRequestDTO, 'senderId'>,
    @ConnectedSocket() client: Socket
  ) {
    const senderId = client.data['userId'];

    // Tạo message mới trong complaint
    const newMessage = await this.complaintService.createComplaintMessage({
      ...message,
      senderId,
    });

    // Broadcast message đến tất cả users trong complaint room (cả admin và user)
    const complaintRoom = generateRoomComplaintId(message.complaintId);
    this.server.to(complaintRoom).emit('newComplaintMessage', newMessage);

    if (this.redisPublisher) {
      try {
        await this.redisPublisher.publish('complaint:complaintUpdated', '');
      } catch (error) {
        console.error('❌ Error publishing to Redis:', error);
      }
    }
  }
}
