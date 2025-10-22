import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  SendOTPRequest,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from '@domain/auth';
import { MessageResponse } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './services/auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'SendOtp')
  sendOtp(data: SendOTPRequest): Promise<MessageResponse> {
    return this.authService.sendOtp({
      email: data.email,
      type: data.type as 'REGISTER' | 'FORGOT_PASSWORD',
    });
  }

  @GrpcMethod('AuthService', 'Register')
  register(data: RegisterRequest): Promise<MessageResponse> {
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
  logout(data: LogoutRequest): Promise<MessageResponse> {
    return this.authService.logout(data);
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    return this.authService.forgotPassword(data);
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    return this.authService.validateToken(data.accessToken);
  }
}
