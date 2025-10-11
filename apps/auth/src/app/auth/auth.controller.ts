import { Body, Controller, Post } from '@nestjs/common';
import { CookieOptions } from 'express';
import { SendOTPBodyDTO } from './auth.dto';
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
  // @ZodSerializerDto(MessageResDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOtp(body);
  }

  // @Post('register')
  // async register(@Body() body: RegisterBodyDTO) {
  //   await this.authService.register(body);
  //   return { message: 'Message.RegisterSuccessfully' };
  // }

  // @Post('login')
  // // @IsPublic()
  // // @ZodSerializerDto(MessageResDTO)
  // async login(
  //   @Body() body: LoginBodyDTO,
  //   @Res({ passthrough: true }) res: Response
  // ) {
  //   const tokens = await this.authService.login(body);

  //   res.cookie('accessToken', tokens.accessToken, {
  //     ...cookieOptions,
  //     maxAge: 60 * 60 * 1000, // 1 giờ
  //   });
  //   res.cookie('refreshToken', tokens.refreshToken, {
  //     ...cookieOptions,
  //     maxAge: 24 * 60 * 60 * 1000, // 1 ngày
  //   });

  //   return { message: 'Message.LoginSuccessfully' };
  // }

  // @Post('refresh-token')
  // // @IsPublic()
  // // @ZodSerializerDto(MessageResDTO)
  // async refreshToken(
  //   @Req() req: Request,
  //   @Res({ passthrough: true }) res: Response
  // ) {
  //   const refreshToken = parse(req.headers.cookie || '').refreshToken;
  //   if (!refreshToken) {
  //     throw new UnauthorizedException('Error.MissingRefreshToken');
  //   }
  //   const tokens = await this.authService.refreshToken({
  //     refreshToken,
  //   });

  //   res.cookie('accessToken', tokens.accessToken, {
  //     ...cookieOptions,
  //     maxAge: 60 * 60 * 1000, // 1 giờ
  //   });

  //   res.cookie('refreshToken', tokens.refreshToken, {
  //     ...cookieOptions,
  //     maxAge: 24 * 60 * 60 * 1000, // 1 ngày
  //   });

  //   return { message: 'Message.RefreshTokenSuccessfully' };
  // }

  // @Post('logout')
  // // @ZodSerializerDto(MessageResDTO)
  // logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  //   res.clearCookie('accessToken', cookieOptions);
  //   res.clearCookie('refreshToken', cookieOptions);

  //   const refreshToken = parse(req.headers.cookie || '').refreshToken;
  //   if (refreshToken) {
  //     return this.authService.logout(refreshToken);
  //   }
  //   return { message: 'Message.LogoutSuccessfully' };
  // }

  // // @Get('google-link')
  // // @IsPublic()
  // // @ZodSerializerDto(GoogleAuthResDTO)
  // // getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
  // //   return this.googleService.getAuthorizationUrl({
  // //     userAgent,
  // //     ip,
  // //   });
  // // }

  // // @Get('google/callback')
  // // @IsPublic()
  // // async googleCallback(
  // //   @Query('code') code: string,
  // //   @Query('state') state: string,
  // //   @Res() res: Response
  // // ) {
  // //   try {
  // //     const data = await this.googleService.googleCallback({
  // //       code,
  // //       state,
  // //     });

  // //     if (data) {
  // //       res.cookie('accessToken', data.accessToken, {
  // //         ...cookieOptions,
  // //         maxAge: 60 * 60 * 1000, // 1 giờ
  // //       });
  // //       res.cookie('refreshToken', data.refreshToken, {
  // //         ...cookieOptions,
  // //         maxAge: 24 * 60 * 60 * 1000, // 1 ngày
  // //       });

  // //       return res.redirect(
  // //         `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?success=true`
  // //       );
  // //     }
  // //   } catch (error) {
  // //     const message =
  // //       error instanceof Error ? error.message : 'Something went wrong';
  // //     return res.redirect(
  // //       `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?error=${encodeURIComponent(
  // //         message
  // //       )}`
  // //     );
  // //   }
  // // }

  // // @Post('2fa/setup')
  // // @ZodSerializerDto(TwoFactorSetupDTO)
  // // setupTwoFactorAuth(
  // //   @Body() _: EmptyBodyDTO,
  // //   @ActiveUser('userId') userId: number
  // // ) {
  // //   return this.authService.setupTwoFactorAuth(userId);
  // // }

  // // @Post('2fa/disable')
  // // @ZodSerializerDto(MessageResDTO)
  // // disableTwoFactorAuth(
  // //   @Body() body: DisableTwoFactorBodyDTO,
  // //   @ActiveUser('userId') userId: number
  // // ) {
  // //   return this.authService.disableTwoFactorAuth({
  // //     ...body,
  // //     userId,
  // //   });
  // // }

  // @Post('forgot-password')
  // // @IsPublic()
  // // @ZodSerializerDto(MessageResDTO)
  // async forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
  //   await this.authService.forgotPassword(body);
  //   return {
  //     message: 'Message.ChangePasswordSuccessfully',
  //   };
  // }
}
