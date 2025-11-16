import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { VehicleRepository } from '../vehicle.repo';

interface ReviewCreatedEvent {
  reviewId: string;
  rating: number;
  bookingId?: string;
  rentalId?: string;
  deviceId?: string;
  comboId?: string;
  vehicleId?: string;
}

@Injectable()
export class ReviewCreatedConsumer
  extends NatsConsumer<ReviewCreatedEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly vehicleRepository: VehicleRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'vehicle-service-review-created',
      filterSubject: 'journey.events.review-created',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: ReviewCreatedEvent): Promise<void> {
    if (!event.vehicleId) {
      return;
    }
    return this.vehicleRepository.reviewVehicle({
      reviewId: event.reviewId,
      vehicleId: event.vehicleId,
      rating: event.rating,
    });
  }
}
