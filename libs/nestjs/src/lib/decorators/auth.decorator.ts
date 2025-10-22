import { SetMetadata } from '@nestjs/common';
import {
  AuthType,
  AuthTypeType,
  ConditionGuard,
  ConditionGuardType,
} from '../constants/auth.constant';

export const AUTH_TYPES_KEY = 'authTypes';

export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeType[];
  option: {
    condition: ConditionGuardType;
  };
};

/**
 * Yêu cầu Bearer token
 * @Auth([AuthType.Bearer])
 *
 * Cho phép cả Bearer hoặc PaymentAPIKey
 * @Auth([AuthType.Bearer, AuthType.PaymentAPIKey], { condition: ConditionGuard.Or })
 *
 * Route công khai
 * @IsPublic()
 */

export const Auth = (
  authTypes: AuthTypeType[],
  option: { condition: ConditionGuardType } = { condition: ConditionGuard.And }
) => {
  return SetMetadata(AUTH_TYPES_KEY, {
    authTypes,
    option,
  });
};

// Decorator để đánh dấu route là public (không cần authentication)
export const IsPublic = () => Auth([AuthType.None]);
