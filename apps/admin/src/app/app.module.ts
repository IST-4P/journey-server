import { AuthGuardModule } from '@hacmieu-journey/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { BookingModule } from './booking/booking.module';
import { ChatModule } from './chat/chat.module';
import { DeviceModule } from './device/device.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthGuardModule,
    AuthModule,
    UserModule,
    NotificationModule,
    ChatModule,
    BlogModule,
    VehicleModule,
    BookingModule,
    DeviceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
