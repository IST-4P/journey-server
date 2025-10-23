import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { ProfileService } from './profile.service';

interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class ProfileConsumer extends NatsConsumer<UserRegisteredEvent> {
  constructor(
    natsClient: NatsClient,
    private readonly ProfileService: ProfileService
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'profile-service-user-registered',
      filterSubject: 'journey.events.user-registered',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: UserRegisteredEvent): Promise<void> {
    // this.logger.log(
    //   `📥 Processing user-registered event for user: ${event.userId}`
    // );

    // Create user profile in User DB
    await this.ProfileService.createProfileFromAuthEvent(event);

    // this.logger.log(
    //   `✅ Successfully created profile for user: ${event.userId}`
    // );
  }
}
