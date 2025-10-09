import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repo';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { HashingService } from './hashing.service';
import { TokenService } from './token.service';
import { UserRepository } from './user.repo';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    UserRepository,
    EmailService,
    ConfigService,
    PrismaService,
    HashingService,
    TokenService,
  ],
  imports: [JwtModule],
})
export class AuthModule {}
