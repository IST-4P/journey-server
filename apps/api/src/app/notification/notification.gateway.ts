import { generateRoomUserId } from '@hacmieu-journey/websocket';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface NotificationType {
  userId: string;
  title: string;
  type: string;
  content: string;
}

@WebSocketGateway({ namespace: 'notification' })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = client.data['userId'];
    if (userId) {
      const room = generateRoomUserId(userId);
      client.join(room);
    }
  }

  handleNotificationCreated(notification: NotificationType) {
    const room = generateRoomUserId(notification.userId);
    this.server.to(room).emit('newNotification', notification);
  }
}
