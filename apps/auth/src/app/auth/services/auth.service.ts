import { NatsClient } from '@hacmieu-journey/nats';
import { AccessTokenPayloadCreate } from '@hacmieu-journey/nestjs';
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from '@hacmieu-journey/prisma';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { addMilliseconds } from 'date-fns';
import ms, { StringValue } from 'ms';
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  UnauthorizedAccessException,
} from '../models/auth.error';
import {
  ForgotPasswordRequestType,
  LoginRequestType,
  LogoutRequestType,
  RefreshTokenRequestType,
  RegisterRequestType,
  SendOTPRequestType,
  TypeOfVerificationCode,
  TypeOfVerificationCodeType,
} from '../models/auth.model';
import { AuthRepository } from '../repositories/auth.repo';
import { UserRepository } from '../repositories/user.repo';
import { EmailService } from './email.service';
import { HashingService } from './hashing.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly natsClient: NatsClient
  ) {}

  generateOTP = () => {
    return String(randomInt(100000, 1000000));
  };

  async generateTokens({ userId, role }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        role,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ]);

    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(
      refreshToken
    );
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateVerificationCode({
    email,
    type,
    code,
  }: {
    email: string;
    type: TypeOfVerificationCodeType;
    code: string;
  }) {
    const verificationCode =
      await this.authRepository.findUniqueVerificationCode({
        email_type: {
          email,
          type,
        },
      });

    if (!verificationCode) {
      throw InvalidOTPException;
    }

    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException;
    }

    if (verificationCode.code !== code) {
      throw InvalidOTPException;
    }
  }

  async sendOtp(body: SendOTPRequestType) {
    // Kiểm tra email có tồn tại hay chưa
    const user = await this.userRepository.findUnique({
      email: body.email,
    });

    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException;
    }

    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException;
    }

    // Tạo mã OTP
    const code = this.generateOTP();
    await this.authRepository.createVerificationCode({
      email: body.email,
      type: body.type,
      code,
      expiresAt: addMilliseconds(
        new Date(),
        ms(this.configService.getOrThrow('OTP_EXPIRES') as StringValue)
      ),
    });

    // Gửi OTP
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    });

    if (error) {
      throw FailedToSendOTPException;
    }

    return {
      message: 'Message.SendOtpSuccessfully',
    };
  }

  async register(body: RegisterRequestType) {
    try {
      // await this.validateVerificationCode({
      //   email: body.email,
      //   type: TypeOfVerificationCode.REGISTER,
      //   code: body.code,
      // });

      const hashedPassword = await this.hashingService.hash(body.password);

      const [user] = await Promise.all([
        this.userRepository.createUser({
          email: body.email,
          name: body.name,
          phone: body.phone,
          password: hashedPassword,
          role: 'USER',
        }),
        // this.authRepository.deleteVerificationCode({
        //   email_type: {
        //     email: body.email,
        //     type: TypeOfVerificationCode.REGISTER,
        //   },
        // }),
      ]);

      // Tạo profile trong User Service qua NATS
      try {
        const eventData = {
          userId: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        };

        await this.natsClient.publish(
          'journey.events.user-registered',
          eventData
        );

        // this.logger.log(
        //   `✅ Published user-registered event for user: ${user.id}`
        // );
      } catch (natsError) {
        // Log error but don't fail registration
        this.logger.error(
          `❌ Failed to publish user-registered event:`,
          natsError
        );
      }

      return {
        message: 'Message.RegisterSuccessfully',
      };
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException;
      }
      throw error;
    }
  }

  async login(body: LoginRequestType) {
    // Kiểm tra user có tồn tại không
    const user = await this.userRepository.findUnique({
      email: body.email,
    });

    if (!user) {
      throw EmailNotFoundException;
    }

    const isPasswordMatch = await this.hashingService.compare(
      body.password,
      user.password
    );
    if (!isPasswordMatch) {
      throw InvalidPasswordException;
    }

    // Tạo mới accessToken và refreshToken
    const tokens = await this.generateTokens({
      userId: user.id,
      role: user.role,
    });

    return tokens;
  }

  async refreshToken({ refreshToken }: RefreshTokenRequestType) {
    try {
      // Kiểm tra token có hợp lê không
      const { userId } = await this.tokenService.verifyRefreshToken(
        refreshToken
      );

      // Kiểm tra có tồn tại trong DB không
      const refreshTokenInDB = await this.authRepository.findUniqueRefreshToken(
        { token: refreshToken }
      );
      if (!refreshTokenInDB) {
        throw RefreshTokenAlreadyUsedException;
      }

      // Lấy dữ liệu
      const user = await this.userRepository.findUnique({ id: userId });

      if (!user) {
        throw UnauthorizedAccessException;
      }

      // Xoá tồn tại trong DB
      const deleteRefreshToken$ = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });

      // Tạo mới accessToken và refreshToken
      const tokens$ = this.generateTokens({
        userId,
        role: user.role,
      });

      const [tokens] = await Promise.all([tokens$, deleteRefreshToken$]);
      return tokens;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw UnauthorizedAccessException;
    }
  }

  async logout({ refreshToken }: LogoutRequestType) {
    try {
      // Kiểm tra token có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken);

      // Xoá token trong DB
      await this.authRepository.deleteRefreshToken({ token: refreshToken });

      return { message: 'Message.LogoutSuccessfully' };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async forgotPassword(body: ForgotPasswordRequestType) {
    const { email, code, newPassword } = body;

    // Kiểm tra email có tồn tại không
    const user = await this.userRepository.findUnique({
      email,
    });
    if (!user) {
      throw EmailNotFoundException;
    }

    // Kiểm tra OTP có hợp lệ không
    await this.validateVerificationCode({
      email,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
      code,
    });

    // Cập nhập mật khẩu và xoá OTP trong DB
    const hashedPassword = await this.hashingService.hash(newPassword);
    await Promise.all([
      this.userRepository.update({ id: user.id }, { password: hashedPassword }),
      this.authRepository.deleteVerificationCode({
        email_type: {
          email,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ]);

    return { message: 'Message.ChangePasswordSuccessfully' };
  }

  /**
   * Validate Access Token - dùng cho gRPC call từ các service khác (bao gồm .NET)
   */
  async validateToken(accessToken: string) {
    try {
      const payload = await this.tokenService.verifyAccessToken(accessToken);

      return {
        isValid: true,
        userId: payload.userId,
        role: payload.role,
        uuid: payload.uuid,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid token';
      this.logger.warn(`Token validation failed: ${errorMessage}`);
      return {
        isValid: false,
        error: errorMessage,
      };
    }
  }
}
