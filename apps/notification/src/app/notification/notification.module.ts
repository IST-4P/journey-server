import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { NotificationGrpcController } from './notification-grpc.controller';
import { NotificationConsumer } from './notification.consumer';
import { NotificationRepository } from './notification.repo';
import { NotificationService } from './notification.service';

@Module({
  imports: [PulsarModule],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationConsumer,
  ],
  controllers: [NotificationGrpcController],
})
export class NotificationModule {}
