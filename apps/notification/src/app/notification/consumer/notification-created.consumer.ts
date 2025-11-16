import { NotificationType } from '@domain/notification';
import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { NotificationService } from '../notification.service';

interface NotificationCreatedEvent {
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
}

@Injectable()
export class NotificationCreatedConsumer extends NatsConsumer<NotificationCreatedEvent> {
  constructor(
    natsClient: NatsClient,
    private readonly notificationService: NotificationService
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'notification-service-notification-created',
      filterSubject: 'journey.events.notification-created',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: NotificationCreatedEvent): Promise<void> {
    // this.logger.log(
    //   `📥 Processing user-registered event for user: ${event.userId}`
    // );

    // Create user profile in User DB
    await this.notificationService.createNotification(event);

    // this.logger.log(
    //   `✅ Successfully created profile for user: ${event.userId}`
    // );
  }
}
