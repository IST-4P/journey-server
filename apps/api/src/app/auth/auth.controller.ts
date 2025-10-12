import { AuthProto } from '@hacmieu-journey/grpc';
import {
  AccessTokenPayload,
  ActiveUser,
  Auth,
  AuthType,
  ConditionGuard,
  IsPublic,
} from '@hacmieu-journey/nestjs';
import {
  Body,
  Controller,
  Get,
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

  @IsPublic()
  @Post('otp')
  async sendOTP(@Body() body: AuthProto.SendOTPRequest) {
    return this.authService.sendOTP(body);
  }

  @IsPublic()
  @Post('register')
  async register(@Body() body: AuthProto.RegisterRequest) {
    return this.authService.register(body);
  }

  @IsPublic()
  @Post('login')
  async login(
    @Body() body: AuthProto.LoginRequest,
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
  async forgotPassword(@Body() body: AuthProto.ForgotPasswordRequest) {
    return this.authService.forgotPassword(body);
  }

  // ===== PROTECTED ROUTES - Ví dụ sử dụng Guards =====

  /**
   * Route được bảo vệ bởi Access Token (Bearer)
   * Mặc định nếu không khai báo @Auth() hoặc @IsPublic()
   */
  @Get('profile')
  getProfile(@ActiveUser() user: AccessTokenPayload) {
    return {
      message: 'User profile',
      user,
    };
  }

  /**
   * Lấy chỉ userId từ token
   */
  @Get('user-id')
  getUserId(@ActiveUser('userId') userId: string) {
    return {
      userId,
    };
  }

  /**
   * Route được bảo vệ bởi Payment API Key
   * Dành cho payment webhook hoặc internal services
   */
  @Auth([AuthType.PaymentAPIKey])
  @Post('payment-webhook')
  handlePaymentWebhook(@Body() body: any) {
    return {
      message: 'Payment webhook received',
      data: body,
    };
  }

  /**
   * Route cho phép cả Bearer Token HOẶC Payment API Key
   * Hữu ích khi endpoint có thể được gọi từ nhiều nguồn
   */
  @Auth([AuthType.Bearer, AuthType.PaymentAPIKey], {
    condition: ConditionGuard.Or,
  })
  @Get('flexible')
  flexibleAuth(@ActiveUser() user: AccessTokenPayload | undefined) {
    return {
      message: 'Flexible authentication',
      user: user || 'Authenticated via API Key',
    };
  }
}
