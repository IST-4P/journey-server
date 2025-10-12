import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const UserProfileNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.UserProfileNotFound',
});

export const UnauthorizedAccessException = new RpcException({
  code: status.UNAUTHENTICATED,
  message: 'Error.UnauthorizedAccess',
});
