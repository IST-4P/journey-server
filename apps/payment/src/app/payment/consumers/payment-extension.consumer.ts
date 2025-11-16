import { PaymentType } from '@domain/payment';
import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { PaymentService } from '../payment.service';

interface ExtensionCreatedEvent {
  id: string;
  userId: string;
  type: PaymentType;
  bookingId?: string;
  rentalId?: string;
  totalAmount: number;
}

@Injectable()
export class PaymentExtensionConsumer
  extends NatsConsumer<ExtensionCreatedEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly paymentService: PaymentService
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'payment-service-payment-extension',
      filterSubject: 'journey.events.payment-extension',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: ExtensionCreatedEvent): Promise<void> {
    await this.paymentService.createPaymentForExtension({
      id: event.id,
      userId: event.userId,
      type: event.type,
      bookingId: event.bookingId || null,
      rentalId: event.rentalId || null,
      amount: event.totalAmount,
    });
  } 
}
