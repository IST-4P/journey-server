import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
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
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    return lastValueFrom(this.authService.sendOtp(data));
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return lastValueFrom(this.authService.register(data));
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return lastValueFrom(this.authService.login(data));
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return lastValueFrom(this.authService.refreshToken(data));
  }

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return lastValueFrom(this.authService.logout(data));
  }

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return lastValueFrom(this.authService.forgotPassword(data));
  }
}
