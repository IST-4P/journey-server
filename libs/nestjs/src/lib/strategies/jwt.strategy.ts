import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { parse } from 'cookie';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload } from '../interfaces/jwt.interface';

/**
 * JWT Strategy sử dụng Passport để xác thực access token
 * Hỗ trợ lấy token từ:
 * - Cookie (accessToken)
 * - Authorization header (Bearer token)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('ACCESS_TOKEN_SECRET'),
    });
  }

  /**
   * Trích xuất JWT từ cookie
   */
  private static extractJwtFromCookie(req: Request): string | null {
    if (req.headers.cookie) {
      const cookies = parse(req.headers.cookie);
      return cookies['accessToken'] || null;
    }
    return null;
  }

  /**
   * Validate payload sau khi token được verify
   * Method này được gọi tự động bởi Passport sau khi verify token thành công
   */
  async validate(payload: AccessTokenPayload): Promise<AccessTokenPayload> {
    if (!payload.userId || !payload.role) {
      throw new UnauthorizedException('Error.InvalidAccessToken');
    }

    return {
      userId: payload.userId,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
      uuid: payload.uuid,
    };
  }
}
