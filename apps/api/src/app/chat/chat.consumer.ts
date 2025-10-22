import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

export interface DataEvent {
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

@Injectable()
export class ChatConsumer extends NatsConsumer<DataEvent> {
  constructor(
    natsClient: NatsClient,
    private readonly chatGateway: ChatGateway
  ) {
    super(natsClient, 'journey.chats.chat-created');
  }

  protected async onMessage(event: DataEvent): Promise<void> {
    // this.logger.log(
    //   `Received notification.created event: ${JSON.stringify(event)}`
    // );
    // this.chatGateway.handleChatCreated(event);
  }
}
