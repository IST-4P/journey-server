import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const DriverLicenseNotFoundException = new RpcException({
  code: status.NOT_FOUND,
  message: 'Error.DriverLicenseNotFound',
});

export const DriverLicenseAlreadyExistsException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.DriverLicenseAlreadyExists',
});

export const LicenseNumberInvalidException = new RpcException({
  code: status.ALREADY_EXISTS,
  message: 'Error.LicenseNumberInvalid',
});
