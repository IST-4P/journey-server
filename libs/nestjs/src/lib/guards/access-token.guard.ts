import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

/**
 * Guard để xác thực Access Token sử dụng Passport JWT Strategy
 * Kế thừa từ AuthGuard('jwt') của Passport
 */
@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Gọi canActivate của AuthGuard để chạy JwtStrategy
    const result = super.canActivate(context);

    // Nếu result là Promise, xử lý async để lưu user vào request
    if (result instanceof Promise) {
      return result.then((success) => {
        if (success) {
          const request = context.switchToHttp().getRequest();
          request[REQUEST_USER_KEY] = request.user;
        }
        return success;
      });
    }

    // Nếu result là Observable
    if (result && typeof result === 'object' && 'subscribe' in result) {
      return result;
    }

    // Nếu result là boolean
    if (result) {
      const request = context.switchToHttp().getRequest();
      request[REQUEST_USER_KEY] = request.user;
    }

    return result;
  }

  /**
   * Handle request sau khi Passport verify token thành công
   * Lưu user payload vào request object
   */
  override handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Error.InvalidOrMissingAccessToken')
      );
    }
    return user;
  }
}
