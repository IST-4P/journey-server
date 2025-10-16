import { PulsarClient, PulsarConsumer } from '@hacmieu-journey/pulsar';
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
export class NotificationConsumer extends PulsarConsumer<DataEvent> {
  constructor(
    pulsarClient: PulsarClient,
    private readonly notificationGateway: NotificationGateway
  ) {
    super(
      pulsarClient,
      'persistent://journey/notifications/notification-created', // Topic
      'notification-service' // Service name
    );
  }

  protected async onMessage(event: DataEvent): Promise<void> {
    // this.logger.log(
    //   `Received notification.created event: ${JSON.stringify(event)}`
    // );
    this.notificationGateway.handleNotificationCreated(event);
  }
}
