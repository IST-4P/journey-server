import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AccessTokenGuard } from './access-token.guard';
import { AdminRoleGuard } from './admin-role.guard';
import { AuthenticationGuard } from './authentication.guard';
import { PaymentAPIKeyGuard } from './payment-api-key.guard';

/**
 * Auth Module - Module tái sử dụng cho authentication
 *
 * Cung cấp:
 * - JWT Strategy với Passport
 * - Access Token Guard
 * - Payment API Key Guard
 * - Authentication Guard (guard tổng hợp)
 *
 * @example
 * // Import vào app module
 * @Module({
 *   imports: [AuthModule],
 *   // ...
 * })
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    AccessTokenGuard,
    AdminRoleGuard,
    PaymentAPIKeyGuard,
    AuthenticationGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [
    JwtStrategy,
    AccessTokenGuard,
    AdminRoleGuard,
    PaymentAPIKeyGuard,
    AuthenticationGuard,
  ],
})
export class AuthGuardModule {}
