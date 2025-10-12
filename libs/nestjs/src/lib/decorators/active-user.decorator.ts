import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../constants/auth.constant';
import { AccessTokenPayload } from '../interfaces/jwt.interface';

/**
 * Lấy toàn bộ thông tin user
 * @ActiveUser() user: AccessTokenPayload
 *
 * Lấy userId
 * @ActiveUser('userId') userId: string
 *
 * Lấy role
 * @ActiveUser('role') role: string
 */
export const ActiveUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: AccessTokenPayload | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  }
);
