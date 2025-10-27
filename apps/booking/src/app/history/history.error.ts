import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const HistoryNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.HistoryNotFound',
});

export const HistoryAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.HistoryAlreadyExists',
});
