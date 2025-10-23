import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const CheckInOutNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.CheckInOutNotFound',
});

export const CheckInOutAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.CheckInOutAlreadyExists',
});
