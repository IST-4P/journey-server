import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const VehicleNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.VehicleNotFound',
});

export const VehicleAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.VehicleAlreadyExists',
});
