import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const BankAccountNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.BankAccountNotFound',
});

export const UnauthorizedAccessException = new RpcException({
  code: status.UNAUTHENTICATED,
  message: 'Error.UnauthorizedAccess',
});
