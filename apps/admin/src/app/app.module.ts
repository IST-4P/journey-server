import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogModule } from './blog/blog.module';
import { BookingModule } from './booking/booking.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    NotificationModule,
    ChatModule,
    BlogModule,
    VehicleModule,
    BookingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
