import { SendOTPRequest } from '@hacmieu-journey/grpc';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  async sendOTP(@Body() body: SendOTPRequest) {
    return this.authService.sendOTP(body);
  }
}
