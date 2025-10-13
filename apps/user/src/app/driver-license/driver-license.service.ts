import { isNotFoundPrismaError } from '@hacmieu-journey/prisma';
import { Injectable } from '@nestjs/common';
import {
  DriverLicenseNotFoundException,
  UnauthorizedAccessException,
} from './driver-license.error';
import {
  CreateDriverLicenseRequestType,
  GetDriverLicenseRequestType,
  UpdateDriverLicenseRequestType,
} from './driver-license.model';
import { DriverLicenseRepository } from './driver-license.repo';

@Injectable()
export class DriverLicenseService {
  constructor(private readonly driverLicenseRepo: DriverLicenseRepository) {}

  async getDriverLicense(data: GetDriverLicenseRequestType) {
    try {
      const result = await this.driverLicenseRepo.findDriverLicenseByUserId(
        data.userId
      );
      return result;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw DriverLicenseNotFoundException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async createDriverLicense(data: CreateDriverLicenseRequestType) {
    return this.driverLicenseRepo.createDriverLicense(data);
  }

  async updateDriverLicense({
    userId,
    ...data
  }: UpdateDriverLicenseRequestType) {
    return this.driverLicenseRepo.updateDriverLicense(userId, data);
  }
}
