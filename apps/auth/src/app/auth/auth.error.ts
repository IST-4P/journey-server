import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const InvalidOTPException = new RpcException({
  code: status.INVALID_ARGUMENT,
  message: 'Error.InvalidOTP',
});

export const OTPExpiredException = new RpcException({
  code: status.INVALID_ARGUMENT,
  message: 'Error.OTPExpired',
});

export const FailedToSendOTPException = new RpcException({
  code: status.INTERNAL,
  message: 'Error.FailedToSendOTP',
});

export const EmailAlreadyExistsException = new RpcException({
  code: status.INVALID_ARGUMENT,
  message: 'Error.EmailAlreadyExists',
});

export const EmailNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.EmailNotFound',
});

export const RefreshTokenAlreadyUsedException = new RpcException({
  code: status.INVALID_ARGUMENT,
  message: 'Error.RefreshTokenAlreadyUsed',
});

export const UnauthorizedAccessException = new RpcException({
  code: status.UNAUTHENTICATED,
  message: 'Error.UnauthorizedAccess',
});

export const InvalidPasswordException = new RpcException({
  code: status.INVALID_ARGUMENT,
  message: 'Error.InvalidPassword',
});
