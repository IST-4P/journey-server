import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { NotificationConsumer } from './notification.consumer';
import { NotificationService } from './notification.service';

@Module({
  imports: [PulsarModule],
  providers: [NotificationService, NotificationConsumer],
  exports: [NotificationService],
})
export class NotificationModule {}
