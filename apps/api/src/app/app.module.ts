import { AuthGuardModule } from '@hacmieu-journey/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthGuardModule,
    AuthModule,
    UserModule,
    NotificationModule,
    ChatModule,
    BlogModule,
    PaymentModule,
  ],
  providers: [],
})
export class AppModule {}
