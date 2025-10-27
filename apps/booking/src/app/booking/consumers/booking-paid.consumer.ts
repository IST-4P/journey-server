import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { BookingRepository } from '../booking.repo';

interface BookingPaidEvent {
  id: string;
}

@Injectable()
export class BookingPaidConsumer
  extends NatsConsumer<BookingPaidEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly bookingRepository: BookingRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'booking-service-booking-paid',
      filterSubject: 'journey.events.booking-paid',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: BookingPaidEvent): Promise<void> {
    return this.bookingRepository.bookingPaid(event);
  }
}
