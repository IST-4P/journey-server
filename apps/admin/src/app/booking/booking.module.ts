import { BookingProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  BookingController,
  CheckInOutController,
  ExtensionController,
  HistoryController,
} from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    NatsModule,
    ClientsModule.registerAsync([
      {
        name: BookingProto.BOOKING_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('BOOKING_GRPC_SERVICE_URL') ||
              'localhost:5008',
            package: BookingProto.BOOKING_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/booking.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    BookingController,
    CheckInOutController,
    ExtensionController,
    HistoryController,
  ],
  providers: [
    BookingService,
    {
      provide: 'BOOKING_SERVICE',
      useExisting: BookingService,
    },
  ],
})
export class BookingModule {}
