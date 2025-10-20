import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { NotificationGrpcController } from './notification-grpc.controller';
import { NotificationConsumer } from './notification.consumer';
import { NotificationRepository } from './notification.repo';
import { NotificationService } from './notification.service';

@Module({
  imports: [NatsModule],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationConsumer,
  ],
  controllers: [NotificationGrpcController],
})
export class NotificationModule {}
