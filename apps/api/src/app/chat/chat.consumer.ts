import { PulsarClient, PulsarConsumer } from '@hacmieu-journey/pulsar';
import { Injectable } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

export interface DataEvent {
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

@Injectable()
export class ChatConsumer extends PulsarConsumer<DataEvent> {
  constructor(
    pulsarClient: PulsarClient,
    private readonly chatGateway: ChatGateway
  ) {
    super(
      pulsarClient,
      'persistent://journey/chats/chat-created', // Topic
      'chat-service' // Service name
    );
  }

  protected async onMessage(event: DataEvent): Promise<void> {
    // this.logger.log(
    //   `Received notification.created event: ${JSON.stringify(event)}`
    // );
    // this.chatGateway.handleChatCreated(event);
  }
}
