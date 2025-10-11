import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  SendOTPRequest,
} from '@hacmieu-journey/grpc';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { parse } from 'cookie';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  // domain: '.hacmieu.xyz',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  async sendOTP(@Body() body: SendOTPRequest) {
    return this.authService.sendOTP(body);
  }

  @Post('register')
  async register(@Body() body: RegisterRequest) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body() body: LoginRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.login(body);

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 giờ
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });

    return { message: 'Message.LoginSuccessfully' };
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = parse(req.headers.cookie || '').refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Error.MissingRefreshToken');
    }
    const tokens = await this.authService.refreshToken({
      refreshToken,
    });

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 giờ
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });

    return { message: 'Message.RefreshTokenSuccessfully' };
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    const refreshToken = parse(req.headers.cookie || '').refreshToken;
    if (refreshToken) {
      return this.authService.logout({ refreshToken });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordRequest) {
    return this.authService.forgotPassword(body);
  }
}
