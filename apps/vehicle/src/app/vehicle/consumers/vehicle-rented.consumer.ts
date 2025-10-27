import { VehicleStatusValues } from '@domain/vehicle';
import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { VehicleRepository } from '../vehicle.repo';

interface VehicleRentedEvent {
  deviceId: string;
}

@Injectable()
export class VehicleRentedConsumer
  extends NatsConsumer<VehicleRentedEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly vehicleRepository: VehicleRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'vehicle-service-vehicle-rented',
      filterSubject: 'journey.events.vehicle-rented',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: VehicleRentedEvent): Promise<void> {
    return this.vehicleRepository.updateStatus({
      id: event.deviceId,
      status: VehicleStatusValues.RENTED,
    });
  }
}
