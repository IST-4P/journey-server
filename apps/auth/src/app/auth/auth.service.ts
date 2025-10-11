import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from '@hacmieu-journey/nestjs';
import { PulsarClient } from '@hacmieu-journey/pulsar';
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
} from './auth.error';
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
  TypeOfVerificationCode,
  TypeOfVerificationCodeType,
} from './auth.model';
import { AuthRepository } from './auth.repo';
import { EmailService } from './email.service';
import { HashingService } from './hashing.service';
import { AccessTokenPayloadCreate } from './token.interface';
import { TokenService } from './token.service';
import { UserRepository } from './user.repo';

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
    private readonly pulsarClient: PulsarClient
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
  }: {
    email: string;
    type: TypeOfVerificationCodeType;
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

    return verificationCode;
  }

  async sendOtp(body: SendOTPBodyType) {
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
      ...body,
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

  async register(body: RegisterBodyType) {
    try {
      // await this.validateVerificationCode({
      //   email: body.email,
      //   type: TypeOfVerificationCode.REGISTER,
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

      // Tạo user-profile trong User Service qua Pulsar
      try {
        const producer = await this.pulsarClient.createProducer(
          'persistent://journey/events/user-registered'
        );

        const eventData = {
          userId: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        };

        await producer.send({
          data: Buffer.from(JSON.stringify(eventData)),
          properties: {
            eventType: 'user.registered',
            version: '1.0',
            source: 'auth-service',
          },
          eventTimestamp: Date.now(),
        });

        // this.logger.log(
        //   `✅ Published user-registered event for user: ${user.id}`
        // );
      } catch (pulsarError) {
        // Log error but don't fail registration
        this.logger.error(
          `❌ Failed to publish user-registered event:`,
          pulsarError
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

  async login(body: LoginBodyType) {
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

  async refreshToken({ refreshToken }: RefreshTokenBodyType) {
    try {
      // Kiểm tra token có hợp lê không
      const { userId } = await this.tokenService.verifyRefreshToken(
        refreshToken
      );

      // Kiểm tra có tồn tại trong DB không
      const refreshTokenInDB = await this.authRepository.findUniqueRefreshToken(
        refreshToken
      );
      if (!refreshTokenInDB) {
        throw RefreshTokenAlreadyUsedException;
      }

      // Lấy dữ liệu
      const user = await this.userRepository.findUnique({ id: userId });

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

  async logout({ refreshToken }: LogoutBodyType) {
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

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body;

    // Kiểm tra email có tồn tại không
    const user = await this.userRepository.findUnique({
      email,
    });
    if (!user) {
      throw EmailNotFoundException;
    }

    // Kiểm tra OTP có hợp lệ không
    const codeInDB = await this.validateVerificationCode({
      email,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    });
    if (!codeInDB || codeInDB.code !== code) {
      throw InvalidOTPException;
    }

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
}
