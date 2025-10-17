import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const NotificationNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.NotificationNotFound',
});
