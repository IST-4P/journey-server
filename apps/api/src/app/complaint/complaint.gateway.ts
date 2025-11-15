import { CreateComplaintMessageRequestDTO } from '@domain/chat';
import { generateRoomComplaintId } from '@hacmieu-journey/websocket';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ComplaintService } from './complaint.service';

@WebSocketGateway({ namespace: 'complaint' })
export class ComplaintGateway implements OnGatewayConnection {
  constructor(private readonly complaintService: ComplaintService) {}

  @WebSocketServer()
  server!: Server;

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
  }
}
