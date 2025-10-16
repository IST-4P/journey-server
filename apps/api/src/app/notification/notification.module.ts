import { NotificationProto } from '@hacmieu-journey/grpc';
import { PulsarModule } from '@hacmieu-journey/pulsar';
import { WebSocketModule } from '@hacmieu-journey/websocket';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotificationConsumer } from './notification.consumer';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    PulsarModule,
    WebSocketModule,
    ClientsModule.registerAsync([
      {
        name: NotificationProto.NOTIFICATION_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('NOTIFICATION_GRPC_SERVICE_URL') ||
              'localhost:5002',
            package: NotificationProto.NOTIFICATION_PACKAGE_NAME,
            protoPath: join(
              __dirname,
              '../../libs/grpc/proto/notification.proto'
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationConsumer,
    NotificationGateway,
    {
      provide: 'NOTIFICATION_SERVICE',
      useExisting: NotificationService,
    },
  ],
})
export class NotificationModule {}
