import { MessageResponseType } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ForgotPasswordRequestType,
  LoginRequestType,
  LoginResponseType,
  LogoutRequestType,
  RefreshTokenRequestType,
  RefreshTokenResponse,
  RegisterRequestType,
  SendOTPRequestType,
  ValidateTokenRequestType,
  ValidateTokenResponseType,
} from './models/auth.model';
import { AuthService } from './services/auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'SendOtp')
  sendOtp(data: SendOTPRequestType): Promise<MessageResponseType> {
    return this.authService.sendOtp({
      email: data.email,
      type: data.type as 'REGISTER' | 'FORGOT_PASSWORD',
    });
  }

  @GrpcMethod('AuthService', 'Register')
  register(data: RegisterRequestType): Promise<MessageResponseType> {
    return this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  login(data: LoginRequestType): Promise<LoginResponseType> {
    return this.authService.login(data);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  refreshToken(data: RefreshTokenRequestType): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(data);
  }

  @GrpcMethod('AuthService', 'Logout')
  logout(data: LogoutRequestType): Promise<MessageResponseType> {
    return this.authService.logout(data);
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  forgotPassword(
    data: ForgotPasswordRequestType
  ): Promise<MessageResponseType> {
    return this.authService.forgotPassword(data);
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  validateToken(
    data: ValidateTokenRequestType
  ): Promise<ValidateTokenResponseType> {
    return this.authService.validateToken(data.accessToken);
  }
}
