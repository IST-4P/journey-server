import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const InvalidOTPException = new UnprocessableEntityException({
  message: 'Error.InvalidOTP',
});

export const OTPExpiredException = new UnprocessableEntityException({
  message: 'Error.OTPExpired',
});

export const FailedToSendOTPException = new UnprocessableEntityException({
  message: 'Error.FailedToSendOTP',
});

export const EmailAlreadyExistsException = new UnprocessableEntityException({
  message: 'Error.EmailAlreadyExists',
});

export const EmailNotFoundException = new UnprocessableEntityException({
  message: 'Error.EmailNotFound',
});

export const RefreshTokenAlreadyUsedException =
  new UnprocessableEntityException({
    message: 'Error.RefreshTokenAlreadyUsed',
  });

export const UnauthorizedAccessException = new UnprocessableEntityException({
  message: 'Error.UnauthorizedAccess',
});

export const InvalidPasswordException = new UnprocessableEntityException({
  message: 'Error.InvalidPassword',
});

export const GoogleUserInfoException = new BadRequestException({
  message: 'Error.FailedToGetGoogleUserInfo',
});
