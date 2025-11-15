import { NotificationProto, UserProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    NatsModule,
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
      {
        name: UserProto.USER_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('USER_GRPC_SERVICE_URL') ||
              'localhost:5001',
            package: UserProto.USER_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/user.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: 'NOTIFICATION_SERVICE',
      useExisting: NotificationService,
    },
  ],
})
export class NotificationModule {}
