import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const BrandNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.BrandNotFound',
});

export const BrandAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.BrandAlreadyExists',
});
