import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
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
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'api-service-chat-created',
      filterSubject: 'journey.events.chat-created',
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
    // this.chatGateway.handleChatCreated(event);
  }
}
