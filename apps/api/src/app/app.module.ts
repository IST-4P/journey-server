import { AuthGuardModule } from '@hacmieu-journey/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { BookingModule } from './booking/booking.module';
import { ChatModule } from './chat/chat.module';
import { DeviceModule } from './device/device.module';
import { MediaModule } from './media/media.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { RentalModule } from './rental/rental.module';
import { ReviewModule } from './review/review.module';
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
    BookingModule,
    PaymentModule,
    VehicleModule,
    DeviceModule,
    RentalModule,
    ReviewModule,
    MediaModule,
  ],
  providers: [],
})
export class AppModule {}
