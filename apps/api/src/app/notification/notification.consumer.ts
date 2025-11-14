import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { NotificationGateway } from './notification.gateway';

interface DataEvent {
  id: string;
  userId: string;
  title: string;
  type: string;
}

@Injectable()
export class NotificationConsumer extends NatsConsumer<DataEvent> {
  constructor(
    natsClient: NatsClient,
    private readonly notificationGateway: NotificationGateway
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'api-service-notification-created',
      filterSubject: 'journey.events.notification-created',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: DataEvent): Promise<void> {
    // this.logger.log(
    //   `Received notification.created event: ${JSON.stringify(event)}`
    // );
    this.notificationGateway.handleNotificationCreated(event);
  }
}
