import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { VehicleRepository } from '../vehicle.repo';

interface VehicleReviewEvent {
  reviewId: string;
  bookingId?: string;
  rentalId?: string;
  vehicleId?: string;
  deviceId?: string;
  comboId?: string;
  rating: number;
}

@Injectable()
export class VehicleReviewConsumer
  extends NatsConsumer<VehicleReviewEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly vehicleRepository: VehicleRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'vehicle-service-vehicle-review',
      filterSubject: 'journey.events.review.created',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: VehicleReviewEvent): Promise<void> {
    if (!event.vehicleId) {
      console.log('[Vehicle] Skipping review event - no vehicleId');
      return;
    }
    console.log('[Vehicle] Received review.created event:', event);
    return this.vehicleRepository.addReviewVehicle({
      reviewId: event.reviewId,
      vehicleId: event.vehicleId,
      bookingId: event.bookingId || '',
      rating: event.rating
    });
  }
}
