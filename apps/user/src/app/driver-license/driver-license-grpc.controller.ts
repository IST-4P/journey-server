import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateDriverLicenseRequestType,
  GetDriverLicenseRequestType,
  GetDriverLicenseResponseType,
  UpdateDriverLicenseRequestType,
} from './driver-license.model';
import { DriverLicenseService } from './driver-license.service';

@Controller()
export class DriverLicenseGrpcController {
  constructor(private readonly driverLicenseService: DriverLicenseService) {}

  @GrpcMethod('UserService', 'GetDriverLicense')
  getDriverLicense(
    data: GetDriverLicenseRequestType
  ): Promise<GetDriverLicenseResponseType> {
    return this.driverLicenseService.getDriverLicense(data);
  }

  @GrpcMethod('UserService', 'CreateDriverLicense')
  createDriverLicense(
    data: CreateDriverLicenseRequestType
  ): Promise<GetDriverLicenseResponseType> {
    return this.driverLicenseService.createDriverLicense(data);
  }

  @GrpcMethod('UserService', 'UpdateDriverLicense')
  updateDriverLicense(
    data: UpdateDriverLicenseRequestType
  ): Promise<GetDriverLicenseResponseType> {
    return this.driverLicenseService.updateDriverLicense(data);
  }
}
