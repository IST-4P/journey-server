import {
  CreateDriverLicenseRequest,
  GetDriverLicenseRequest,
  UpdateDriverLicenseRequest,
} from '@domain/user';
import { Injectable } from '@nestjs/common';
import {
  DriverLicenseAlreadyExistsException,
  DriverLicenseNotFoundException,
} from './driver-license.error';
import { DriverLicenseRepository } from './driver-license.repo';

@Injectable()
export class DriverLicenseService {
  constructor(private readonly driverLicenseRepo: DriverLicenseRepository) {}

  async getDriverLicense(data: GetDriverLicenseRequest) {
    const result = await this.driverLicenseRepo.findDriverLicenseByUserId(
      data.userId
    );
    if (!result) {
      throw DriverLicenseNotFoundException;
    }
    return result;
  }

  async createDriverLicense(data: CreateDriverLicenseRequest) {
    const result = await this.driverLicenseRepo.findDriverLicenseByUserId(
      data.userId
    );
    if (result) {
      throw DriverLicenseAlreadyExistsException;
    }
    return this.driverLicenseRepo.createDriverLicense(data);
  }

  async updateDriverLicense({ userId, ...data }: UpdateDriverLicenseRequest) {
    const result = await this.driverLicenseRepo.findDriverLicenseByUserId(
      userId
    );
    if (!result) {
      throw DriverLicenseNotFoundException;
    }
    return this.driverLicenseRepo.updateDriverLicense(userId, data);
  }
}
