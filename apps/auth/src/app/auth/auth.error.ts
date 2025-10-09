import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const InvalidOTPException = new UnprocessableEntityException(
  'Error.InvalidOTP'
);

export const OTPExpiredException = new UnprocessableEntityException(
  'Error.OTPExpired'
);

export const FailedToSendOTPException = new UnprocessableEntityException(
  'Error.FailedToSendOTP'
);

export const EmailAlreadyExistsException = new UnprocessableEntityException(
  'Error.EmailAlreadyExists'
);

export const EmailNotFoundException = new UnprocessableEntityException(
  'Error.EmailNotFound'
);

export const RefreshTokenAlreadyUsedException =
  new UnprocessableEntityException('Error.RefreshTokenAlreadyUsed');

export const UnauthorizedAccessException = new UnprocessableEntityException(
  'Error.UnauthorizedAccess'
);

export const InvalidPasswordException = new UnprocessableEntityException(
  'Error.InvalidPassword'
);

export const GoogleUserInfoException = new BadRequestException(
  'Error.FailedToGetGoogleUserInfo'
);
