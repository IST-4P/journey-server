import {
  CreateDriverLicenseRequest,
  GetDriverLicenseRequest,
  GetDriverLicenseResponse,
  UpdateDriverLicenseRequest,
  VerifyDriverLicenseRequest,
} from '@domain/user';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DriverLicenseService } from './driver-license.service';

@Controller()
export class DriverLicenseGrpcController {
  constructor(private readonly driverLicenseService: DriverLicenseService) {}

  @GrpcMethod('UserService', 'GetDriverLicense')
  getDriverLicense(
    data: GetDriverLicenseRequest
  ): Promise<GetDriverLicenseResponse> {
    return this.driverLicenseService.getDriverLicense(data);
  }

  @GrpcMethod('UserService', 'CreateDriverLicense')
  createDriverLicense(
    data: CreateDriverLicenseRequest
  ): Promise<GetDriverLicenseResponse> {
    return this.driverLicenseService.createDriverLicense(data);
  }

  @GrpcMethod('UserService', 'UpdateDriverLicense')
  updateDriverLicense(
    data: UpdateDriverLicenseRequest
  ): Promise<GetDriverLicenseResponse> {
    return this.driverLicenseService.updateDriverLicense(data);
  }

  @GrpcMethod('UserService', 'VerifyDriverLicense')
  verifyDriverLicense(
    data: VerifyDriverLicenseRequest
  ): Promise<GetDriverLicenseResponse> {
    return this.driverLicenseService.verifyDriverLicense(data);
  }
}
