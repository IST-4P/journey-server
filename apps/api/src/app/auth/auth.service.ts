import { AuthProto } from '@hacmieu-journey/grpc';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: AuthProto.AuthServiceClient;

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

  async register(
    data: AuthProto.RegisterRequest
  ): Promise<AuthProto.RegisterResponse> {
    try {
      const result = await lastValueFrom(this.authService.register(data));
      return result;
    } catch (error) {
      if (error.code === 3) {
        // INVALID_ARGUMENT
        throw new UnprocessableEntityException({
          message: error.details || 'Invalid input',
        });
      }
      if (error.code === 5) {
        // NOT_FOUND
        throw new NotFoundException({
          message: error.details || 'Not found',
        });
      }
      if (error.code === 6) {
        // ALREADY_EXISTS
        throw new ConflictException({
          message: error.details || 'Already exists',
        });
      }
      if (error.code === 16) {
        // UNAUTHENTICATED
        throw new UnauthorizedException({
          message: error.details || 'Unauthorized',
        });
      }

      // Default error
      throw new InternalServerErrorException({
        message: 'Internal server error',
      });
    }
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
