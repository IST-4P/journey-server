import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType, ConditionGuard } from '../constants/auth.constant';
import {
  AUTH_TYPES_KEY,
  AuthTypeDecoratorPayload,
} from '../decorators/auth.decorator';
import { AccessTokenGuard } from './access-token.guard';
import { PaymentAPIKeyGuard } from './payment-api-key.guard';

/**
 * Guard chính để xử lý authentication
 * Hỗ trợ nhiều loại auth và condition (And/Or)
 *
 * @example
 * // Trong controller/method
 * @Auth([AuthType.Bearer]) // Mặc định
 * @Auth([AuthType.PaymentAPIKey])
 * @Auth([AuthType.Bearer, AuthType.PaymentAPIKey], { condition: ConditionGuard.Or })
 * @IsPublic() // Không cần auth
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly paymentAPIKeyGuard: PaymentAPIKeyGuard
  ) {
    // Map các loại auth type với guard tương ứng
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.PaymentAPIKey]: this.paymentAPIKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  /**
   * Lấy auth type configuration từ metadata
   */
  private getAuthTypeValue(
    context: ExecutionContext
  ): AuthTypeDecoratorPayload {
    return (
      this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(
        AUTH_TYPES_KEY,
        [context.getHandler(), context.getClass()]
      ) ?? {
        authTypes: [AuthType.Bearer], // Mặc định yêu cầu Bearer token
        option: { condition: ConditionGuard.And },
      }
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.getAuthTypeValue(context);
    const guards = authTypeValue.authTypes.map(
      (type) => this.authTypeGuardMap[type]
    );

    return authTypeValue.option.condition === ConditionGuard.And
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context);
  }

  /**
   * Xử lý OR condition: chỉ cần 1 guard pass là đủ
   */
  private async handleOrCondition(
    guards: CanActivate[],
    context: ExecutionContext
  ) {
    let lastError: any = null;

    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) {
          return true;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof HttpException) {
      throw lastError;
    }

    throw new UnauthorizedException('Error.Unauthorized');
  }

  /**
   * Xử lý AND condition: tất cả guards phải pass
   */
  private async handleAndCondition(
    guards: CanActivate[],
    context: ExecutionContext
  ) {
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException('Error.Unauthorized');
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new UnauthorizedException('Error.Unauthorized');
      }
    }
    return true;
  }
}
