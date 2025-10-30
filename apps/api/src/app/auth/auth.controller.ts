import {
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  SendOTPRequestDTO,
} from '@domain/auth';
import { IsPublic } from '@hacmieu-journey/nestjs';
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
  secure: false,
  sameSite: 'lax',
  // domain: '.hacmieu.xyz',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('otp')
  async sendOTP(@Body() body: SendOTPRequestDTO) {
    return this.authService.sendOTP(body);
  }

  @IsPublic()
  @Post('register')
  async register(@Body() body: RegisterRequestDTO) {
    return this.authService.register(body);
  }

  @IsPublic()
  @Post('login')
  async login(
    @Body() body: LoginRequestDTO,
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

  @IsPublic()
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

  @IsPublic()
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    const refreshToken = parse(req.headers.cookie || '').refreshToken;
    if (refreshToken) {
      return this.authService.logout({ refreshToken });
    }
  }

  @IsPublic()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordRequestDTO) {
    return this.authService.forgotPassword(body);
  }
}
