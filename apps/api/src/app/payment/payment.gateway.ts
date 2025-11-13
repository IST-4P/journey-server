import { generateRoomUserId } from '@hacmieu-journey/websocket';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface PaymentType {
  paymentCode: string;
  userId: string;
  message: string;
}

@WebSocketGateway({ namespace: 'payment' })
export class PaymentGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const paymentCode = client.handshake.query.paymentCode;
    if (paymentCode) {
      const room = generateRoomUserId(paymentCode as string);
      client.join(room);
    }
  }

  handlePaymentSuccess(payment: PaymentType) {
    console.log('payment: ', payment);
    const room = generateRoomUserId(payment.userId);
    this.server.to(room).emit('payment', payment);
  }
}
