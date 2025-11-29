import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { BookingRepository } from '../booking.repo';

interface BookingReviewEvent {
  reviewId: string;
  bookingId?: string;
  rentalId?: string;
  vehicleId?: string;
  deviceId?: string;
  comboId?: string;
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
      filterSubject: 'journey.events.review.created',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: BookingReviewEvent): Promise<void> {
    if (!event.bookingId) {
      console.log('[Booking] Skipping review event - no bookingId');
      return;
    }
    console.log('[Booking] Received review.created event:', event);
    return this.bookingRepository.addReviewBooking({
      reviewId: event.reviewId,
      bookingId: event.bookingId,
      vehicleId: event.vehicleId || '',
      rating: event.rating
    });
  }
}
