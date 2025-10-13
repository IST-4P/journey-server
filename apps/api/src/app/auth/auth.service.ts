import { AuthProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService!: AuthProto.AuthServiceClient;

  constructor(
    @Inject(AuthProto.AUTH_PACKAGE_NAME) private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthProto.AuthServiceClient>(
      AuthProto.AUTH_SERVICE_NAME
    );
  }

  async sendOTP(
    data: AuthProto.SendOTPRequest
  ): Promise<AuthProto.SendOTPResponse> {
    return lastValueFrom(this.authService.sendOtp(data));
  }

  register(
    data: AuthProto.RegisterRequest
  ): Promise<AuthProto.RegisterResponse> {
    return lastValueFrom(this.authService.register(data));
  }

  async login(data: AuthProto.LoginRequest): Promise<AuthProto.LoginResponse> {
    return lastValueFrom(this.authService.login(data));
  }

  async refreshToken(
    data: AuthProto.RefreshTokenRequest
  ): Promise<AuthProto.RefreshTokenResponse> {
    return lastValueFrom(this.authService.refreshToken(data));
  }

  async logout(
    data: AuthProto.LogoutRequest
  ): Promise<AuthProto.LogoutResponse> {
    return lastValueFrom(this.authService.logout(data));
  }

  async forgotPassword(
    data: AuthProto.ForgotPasswordRequest
  ): Promise<AuthProto.ForgotPasswordResponse> {
    return lastValueFrom(this.authService.forgotPassword(data));
  }
}
