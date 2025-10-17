import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  AccessTokenPayload,
  AccessTokenPayloadCreate,
  RefreshTokenPayload,
  RefreshTokenPayloadCreate,
} from '@hacmieu-journey/nestjs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  signAccessToken(payload: AccessTokenPayloadCreate) {
    return this.jwtService.signAsync(
      { ...payload, uuid: uuidv4() },
      {
        secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow('ACCESS_TOKEN_EXPIRES_IN'),
        algorithm: 'HS256',
      }
    );
  }

  signRefreshToken(payload: RefreshTokenPayloadCreate) {
    return this.jwtService.signAsync(
      { ...payload, uuid: uuidv4() },
      {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow('REFRESH_TOKEN_EXPIRES_IN'),
        algorithm: 'HS256',
      }
    );
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
    });
  }
}
