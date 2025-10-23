import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const PaymentNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.PaymentNotFound',
});

export const PaymentAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.PaymentAlreadyExists',
});
