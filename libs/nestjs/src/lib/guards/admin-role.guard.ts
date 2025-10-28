import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

/**
 * Guard để kiểm tra quyền ADMIN
 * Đảm bảo user đã được authenticate và có role ADMIN
 */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];

    if (!user) {
      throw new ForbiddenException('Error.InsufficientPermissions');
    }

    // Giả sử user có trường 'role' hoặc 'roles'
    // Có thể điều chỉnh dựa trên cấu trúc user thực tế
    if (user.role !== 'ADMIN' && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException('Error.InsufficientPermissions');
    }

    return true;
  }
}
