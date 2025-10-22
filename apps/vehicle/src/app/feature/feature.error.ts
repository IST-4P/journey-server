import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const FeatureNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.FeatureNotFound',
});

export const FeatureAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.FeatureAlreadyExists',
});
