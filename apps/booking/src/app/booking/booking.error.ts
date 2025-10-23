import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const BookingNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.BookingNotFound',
});

export const BookingAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.BookingAlreadyExists',
});
