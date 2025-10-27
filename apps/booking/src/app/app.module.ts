import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from './booking/booking.module';
import { CheckInOutModule } from './check-in-out/check-in-out.module';
import { ExtensionModule } from './extension/extension.module';
import { HistoryModule } from './history/history.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BookingModule,
    HistoryModule,
    CheckInOutModule,
    ExtensionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
