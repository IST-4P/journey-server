import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const ExtensionNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.ExtensionNotFound',
});

export const ExtensionAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.ExtensionAlreadyExists',
});
