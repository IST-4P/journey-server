import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGrpcController } from './auth-grpc.controller';
import { AuthRepository } from './auth.repo';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { HashingService } from './hashing.service';
import { TokenService } from './token.service';
import { UserRepository } from './user.repo';

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
