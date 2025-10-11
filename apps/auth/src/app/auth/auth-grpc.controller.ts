import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  SendOTPRequest,
  SendOTPResponse,
} from '@hacmieu-journey/grpc';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'SendOtp')
  sendOtp(data: SendOTPRequest): Promise<SendOTPResponse> {
    return this.authService.sendOtp({
      email: data.email,
      type: data.type as 'REGISTER' | 'FORGOT_PASSWORD',
    });
  }

  @GrpcMethod('AuthService', 'Register')
  register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  login(data: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(data);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(data);
  }

  @GrpcMethod('AuthService', 'Logout')
  logout(data: LogoutRequest): Promise<LogoutResponse> {
    return this.authService.logout(data);
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(data);
  }
}
