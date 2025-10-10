import { SendOTPRequest, SendOTPResponse } from '@hacmieu-journey/grpc';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'SendOTP')
  async sendOtp(data: SendOTPRequest): Promise<SendOTPResponse> {
    const result = await this.authService.sendOTP({
      email: data.email,
      type: data.type as 'REGISTER' | 'FORGOT_PASSWORD',
    });

    return {
      message: result.message,
    };
  }
}
