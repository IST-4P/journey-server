import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { BookingRepository } from '../booking.repo';

interface BookingExpiredEvent {
  id: string;
}

@Injectable()
export class BookingExpiredConsumer
  extends NatsConsumer<BookingExpiredEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly bookingRepository: BookingRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'booking-service-booking-expired',
      filterSubject: 'journey.events.booking-expired',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: BookingExpiredEvent): Promise<void> {
    return this.bookingRepository.bookingExpired(event);
  }
}
