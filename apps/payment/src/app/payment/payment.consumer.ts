import { PaymentType } from '@domain/payment';
import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { PaymentService } from './payment.service';

interface BookingCreatedEvent {
  id: string;
  userId: string;
  type: PaymentType;
  bookingId?: string;
  rentalId?: string;
  totalAmount: number;
}

@Injectable()
export class PaymentConsumer
  extends NatsConsumer<BookingCreatedEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly paymentService: PaymentService
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'payment-service-booking-created',
      filterSubject: 'journey.events.booking-created',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: BookingCreatedEvent): Promise<void> {
    // this.logger.log(
    //   `Processing booking created event: ${JSON.stringify(event)}`
    // );

    await this.paymentService.createPayment({
      id: event.id,
      userId: event.userId,
      type: event.type,
      bookingId: event.bookingId || null,
      rentalId: event.rentalId || null,
      amount: event.totalAmount,
    });
  }
}
