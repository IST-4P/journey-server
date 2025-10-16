import { AuthGuardModule } from '@hacmieu-journey/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthGuardModule,
    AuthModule,
    UserModule,
    NotificationModule,
  ],
  providers: [],
})
export class AppModule {}
