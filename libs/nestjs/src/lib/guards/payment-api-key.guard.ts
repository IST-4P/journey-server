import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard để xác thực Payment API Key
 * Kiểm tra API key trong Authorization header
 */
@Injectable()
export class PaymentAPIKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const paymentApiKey = request.headers['authorization']?.split(' ')[1];

    const expectedApiKey = this.configService.get<string>('PAYMENT_API_KEY');

    if (!expectedApiKey) {
      throw new UnauthorizedException('Error.PaymentAPIKeyNotConfigured');
    }

    if (paymentApiKey !== expectedApiKey) {
      throw new UnauthorizedException('Error.InvalidPaymentAPIKey');
    }

    return true;
  }
}
