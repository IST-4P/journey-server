import { generateRoomUserId } from '@hacmieu-journey/websocket';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface ChatType {
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = client.data['userId'];
    if (userId) {
      const room = generateRoomUserId(userId);
      client.join(room);
    }
  }

  handleChatCreated(chat: ChatType) {
    const room = generateRoomUserId(chat.toUserId);
    this.server.to(room).emit('newChat', chat);
  }
}
