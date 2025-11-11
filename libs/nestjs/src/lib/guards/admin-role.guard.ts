import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { REQUEST_USER_KEY } from '../constants/auth.constant';
import { AccessTokenGuard } from './access-token.guard';

/**
 * Guard để kiểm tra quyền ADMIN
 * Kế thừa từ AccessTokenGuard để tái sử dụng logic verify JWT
 * Sau khi verify token thành công, kiểm tra role của user
 */
@Injectable()
export class AdminRoleGuard extends AccessTokenGuard {
  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Bước 1: Gọi AccessTokenGuard để verify JWT token
    const result = super.canActivate(context);

    // Bước 2: Sau khi verify token, check role
    // Nếu result là Promise
    if (result instanceof Promise) {
      return result.then((success) => {
        if (success) {
          this.validateAdminRole(context);
        }
        return success;
      });
    }

    // Nếu result là Observable
    if (result && typeof result === 'object' && 'subscribe' in result) {
      // Chuyển Observable thành Promise để xử lý async
      return new Promise((resolve, reject) => {
        (result as Observable<boolean>).subscribe({
          next: (success) => {
            if (success) {
              try {
                this.validateAdminRole(context);
                resolve(true);
              } catch (error) {
                reject(error);
              }
            } else {
              resolve(false);
            }
          },
          error: (error) => reject(error),
        });
      });
    }

    // Nếu result là boolean
    if (result) {
      this.validateAdminRole(context);
    }

    return result;
  }

  /**
   * Validate admin role từ user đã được authenticate
   * @throws ForbiddenException nếu user không có quyền ADMIN
   */
  private validateAdminRole(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];

    if (!user) {
      throw new ForbiddenException('Error.InsufficientPermissions');
    }

    // Kiểm tra role: hỗ trợ cả 'role' (string) và 'roles' (array)
    const hasAdminRole =
      user.role === 'ADMIN' ||
      user.roles?.includes('ADMIN') ||
      user.role === 'admin' ||
      user.roles?.includes('admin');

    if (!hasAdminRole) {
      throw new ForbiddenException('Error.InsufficientPermissions');
    }
  }
}
