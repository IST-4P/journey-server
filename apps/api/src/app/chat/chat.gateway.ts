import { ChatProto } from '@hacmieu-journey/grpc';
import { generateRoomUserId } from '@hacmieu-journey/websocket';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatRequestDTO } from './chat.dto';
import { ChatService } from './chat.service';

export interface ChatType {
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server!: Server;

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
      fromUserId,
      ...message,
    } as ChatProto.CreateChatRequest);
    const recipientRoom = generateRoomUserId(message.toUserId);
    this.server.to(recipientRoom).emit('newChat', newMessage);

    // 3. Gửi lại tin nhắn cho chính người gửi để cập nhật UI của họ.
    client.emit('newChat', newMessage);
  }
}
