import { Module } from '@nestjs/common';
import { DriverLicenseGrpcController } from './driver-license-grpc.controller';
import { DriverLicenseRepository } from './driver-license.repo';
import { DriverLicenseService } from './driver-license.service';

@Module({
  imports: [],
  providers: [DriverLicenseService, DriverLicenseRepository],
  controllers: [DriverLicenseGrpcController],
})
export class DriverLicenseModule {}
