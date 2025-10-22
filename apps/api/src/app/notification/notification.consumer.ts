import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

interface DataEvent {
  id: string;
  userId: string;
  title: string;
  type: string;
  createdAt: string;
}

@Injectable()
export class NotificationConsumer extends NatsConsumer<DataEvent> {
  constructor(
    natsClient: NatsClient,
    private readonly notificationGateway: NotificationGateway
  ) {
    super(natsClient, 'journey.notifications.notification-created');
  }

  protected async onMessage(event: DataEvent): Promise<void> {
    // this.logger.log(
    //   `Received notification.created event: ${JSON.stringify(event)}`
    // );
    this.notificationGateway.handleNotificationCreated(event);
  }
}
