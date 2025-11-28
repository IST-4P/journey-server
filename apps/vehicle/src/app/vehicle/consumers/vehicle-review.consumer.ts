import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { VehicleRepository } from '../vehicle.repo';

interface VehicleReviewEvent {
  bookingId: string;
  reviewId: string;
  vehicleId: string;
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
      filterSubject: 'journey.events.review-booking',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: VehicleReviewEvent): Promise<void> {
    console.log(event);
    return this.vehicleRepository.addReviewVehicle(event);
  }
}
