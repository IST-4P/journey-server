import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const ConversationsNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.ConversationsNotFound',
});

export const ChatsNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.ChatsNotFound',
});
