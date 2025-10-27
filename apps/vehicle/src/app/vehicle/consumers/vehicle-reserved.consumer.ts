import { VehicleStatusValues } from '@domain/vehicle';
import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { VehicleRepository } from '../vehicle.repo';

interface VehicleReservedEvent {
  id: string;
}

@Injectable()
export class VehicleReservedConsumer
  extends NatsConsumer<VehicleReservedEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly vehicleRepository: VehicleRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'vehicle-service-vehicle-reserved',
      filterSubject: 'journey.events.vehicle-reserved',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: VehicleReservedEvent): Promise<void> {
    return this.vehicleRepository.updateStatus({
      id: event.id,
      status: VehicleStatusValues.RESERVED,
    });
  }
}
