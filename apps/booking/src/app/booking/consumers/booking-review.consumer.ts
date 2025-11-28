import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { BookingRepository } from '../booking.repo';

interface BookingReviewEvent {
  bookingId: string;
  reviewId: string;
  vehicleId: string;
  rating: number;
}

@Injectable()
export class BookingReviewConsumer
  extends NatsConsumer<BookingReviewEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly bookingRepository: BookingRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'booking-service-booking-review',
      filterSubject: 'journey.events.review-booking',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: BookingReviewEvent): Promise<void> {
    return this.bookingRepository.addReviewBooking(event);
  }
}
