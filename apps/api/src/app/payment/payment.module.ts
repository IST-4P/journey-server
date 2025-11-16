import { BookingProto, PaymentProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PaymentController, RefundController } from './payment.controller';
import { PaymentGateway } from './payment.gateway';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    NatsModule,
    ClientsModule.registerAsync([
      {
        name: PaymentProto.PAYMENT_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('PAYMENT_GRPC_SERVICE_URL') ||
              'localhost:5009',
            package: PaymentProto.PAYMENT_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/payment.proto'),
          },
        }),
        inject: [ConfigService],
      },
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
  controllers: [PaymentController, RefundController],
  providers: [
    PaymentService,
    PaymentGateway,
    {
      provide: 'PAYMENT_SERVICE',
      useExisting: PaymentService,
    },
  ],
})
export class PaymentModule {}
