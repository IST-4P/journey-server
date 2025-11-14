import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const ComplaintNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.ComplaintNotFound',
});
