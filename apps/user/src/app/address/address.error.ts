import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const AddressNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.AddressNotFound',
});

export const UnauthorizedAccessException = new RpcException({
  code: status.UNAUTHENTICATED,
  message: 'Error.UnauthorizedAccess',
});
