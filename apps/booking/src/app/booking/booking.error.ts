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

export const BookingTimeInvalidException = new RpcException({
  code: status.INVALID_ARGUMENT,
  message: 'Error.BookingTimeInvalid',
});

export const BookingCannotCancelWithCheckInsException = new RpcException({
  code: status.FAILED_PRECONDITION,
  message: 'Error.BookingCannotCancelWithCheckIns',
});

export const BookingCannotCancelException = new RpcException({
  code: status.FAILED_PRECONDITION,
  message: 'Error.BookingCannotCancel',
});

export const BookingNotPaidException = new RpcException({
  code: status.FAILED_PRECONDITION,
  message: 'Error.BookingNotPaid',
});

export const BookingAlreadyCancelledException = new RpcException({
  code: status.FAILED_PRECONDITION,
  message: 'Error.BookingAlreadyCancelled',
});
