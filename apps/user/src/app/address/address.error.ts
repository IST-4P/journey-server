import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const AddressNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.AddressNotFound',
});

export const AddressAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.AddressAlreadyExists',
});
