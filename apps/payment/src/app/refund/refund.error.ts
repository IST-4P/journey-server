import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const RefundNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.RefundNotFound',
});

export const RefundAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.RefundAlreadyExists',
});
