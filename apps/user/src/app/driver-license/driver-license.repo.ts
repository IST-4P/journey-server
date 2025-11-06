import { VerifyDriverLicenseRequest } from '@domain/user';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriverLicenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDriverLicenseByUserId(
    userId: Prisma.DriverLicenseWhereUniqueInput['userId']
  ) {
    return this.prisma.driverLicense.findUnique({
      where: {
        userId,
      },
    });
  }

  async createDriverLicense(data: Prisma.DriverLicenseUncheckedCreateInput) {
    return this.prisma.driverLicense.create({
      data,
    });
  }

  async updateDriverLicense(
    userId: Prisma.DriverLicenseWhereUniqueInput['userId'],
    data: Prisma.DriverLicenseUpdateInput
  ) {
    return this.prisma.driverLicense.update({
      where: { userId },
      data,
    });
  }

  async verifyDriverLicense({
    userId,
    isVerified,
    rejectedReason,
  }: VerifyDriverLicenseRequest) {
    return this.prisma.driverLicense.update({
      where: { userId },
      data: {
        isVerified,
        rejectedReason,
      },
    });
  }
}
