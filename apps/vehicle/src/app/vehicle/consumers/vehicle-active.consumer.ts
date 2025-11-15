import { VehicleStatusValues } from '@domain/vehicle';
import { NatsClient, NatsConsumer } from '@hacmieu-journey/nats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AckPolicy, DeliverPolicy } from 'nats';
import { VehicleRepository } from '../vehicle.repo';

interface VehicleActiveEvent {
  id: string;
}

@Injectable()
export class VehicleActiveConsumer
  extends NatsConsumer<VehicleActiveEvent>
  implements OnModuleInit
{
  constructor(
    natsClient: NatsClient,
    private readonly vehicleRepository: VehicleRepository
  ) {
    super(natsClient, {
      streamName: 'JOURNEY_EVENTS',
      consumerName: 'vehicle-service-vehicle-active',
      filterSubject: 'journey.events.vehicle-active',
      ackPolicy: AckPolicy.Explicit, // Phải ack thủ công
      deliverPolicy: DeliverPolicy.All, // Nhận tất cả message (kể cả cũ)
      maxDeliver: 3, // Retry tối đa 3 lần
      ackWait: 30000, // Timeout 30s
    });
  }

  protected async onMessage(event: VehicleActiveEvent): Promise<void> {
    return this.vehicleRepository.updateStatus({
      id: event.id,
      status: VehicleStatusValues.ACTIVE,
    });
  }
}
