import { Module } from '@nestjs/common';
import { VehicleGrpcController } from './vehicle-grpc.controller';
import { VehicleRepository } from './vehicle.repo';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [],
  providers: [VehicleService, VehicleRepository],
  controllers: [VehicleGrpcController],
})
export class VehicleModule {}
