import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGrpcController } from './auth-grpc.controller';
import { AuthRepository } from './repositories/auth.repo';
import { UserRepository } from './repositories/user.repo';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [JwtModule, PulsarModule],
  controllers: [AuthGrpcController],
  providers: [
    AuthService,
    AuthRepository,
    UserRepository,
    EmailService,
    HashingService,
    TokenService,
  ],
})
export class AuthModule {}
