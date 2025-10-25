import { PaymentProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { WebSocketModule } from '@hacmieu-journey/websocket';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    NatsModule,
    WebSocketModule,
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
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'PAYMENT_SERVICE',
      useExisting: PaymentService,
    },
  ],
})
export class PaymentModule {}
