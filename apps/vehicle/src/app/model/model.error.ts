import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const ModelNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.ModelNotFound',
});

export const ModelAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.ModelAlreadyExists',
});
