import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileById(userId: Prisma.ProfileWhereUniqueInput) {
    return this.prisma.profile.findUniqueOrThrow({
      where: userId,
      include: {
        driverLicense: true,
        bankAccount: true,
        addresses: true,
      },
    });
  }

  async createProfile(data: Prisma.ProfileCreateInput) {
    return this.prisma.profile.create({
      data,
    });
  }

  async updateProfile(userId: string, data: Prisma.ProfileUpdateInput) {
    return this.prisma.profile.update({
      where: { id: userId },
      data,
    });
  }
}
