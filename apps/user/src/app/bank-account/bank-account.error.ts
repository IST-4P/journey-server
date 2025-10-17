import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const BankAccountNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.BankAccountNotFound',
});

export const BankAccountAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.BankAccountAlreadyExists',
});
