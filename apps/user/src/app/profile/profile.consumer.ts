import { PulsarClient, PulsarConsumer } from '@hacmieu-journey/pulsar';
import { Injectable } from '@nestjs/common';
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
export class ProfileConsumer extends PulsarConsumer<UserRegisteredEvent> {
  constructor(
    pulsarClient: PulsarClient,
    private readonly ProfileService: ProfileService
  ) {
    super(
      pulsarClient,
      'persistent://journey/events/user-registered', // Topic
      'user-service' // Service name
    );
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
