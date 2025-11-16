import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import {
  NotificationCreatedConsumer,
  NotificationRegisterConsumer,
} from './consumer';
import { NotificationGrpcController } from './notification-grpc.controller';
import { NotificationRepository } from './notification.repo';
import { NotificationService } from './notification.service';

@Module({
  imports: [NatsModule],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationRegisterConsumer,
    NotificationCreatedConsumer,
  ],
  controllers: [NotificationGrpcController],
})
export class NotificationModule {}
