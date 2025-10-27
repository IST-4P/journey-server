import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { VehicleRentedConsumer, VehicleReservedConsumer } from './consumers';
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
  ],
  controllers: [VehicleGrpcController],
})
export class VehicleModule {}
