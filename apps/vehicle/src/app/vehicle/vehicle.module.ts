import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import {
  VehicleActiveConsumer,
  VehicleMaintenanceConsumer,
  VehicleRentedConsumer,
  VehicleReservedConsumer,
  VehicleReviewConsumer,
} from './consumers';
import { VehicleGrpcController } from './vehicle-grpc.controller';
import { VehicleRepository } from './vehicle.repo';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [NatsModule],
  providers: [
    VehicleService,
    VehicleRepository,
    VehicleReservedConsumer,
    VehicleRentedConsumer,
    VehicleActiveConsumer,
    VehicleReviewConsumer,
    VehicleMaintenanceConsumer,
  ],
  controllers: [VehicleGrpcController],
})
export class VehicleModule {}
