import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileById(userId: Prisma.UserProfileWhereUniqueInput) {
    return this.prisma.userProfile.findUnique({
      where: userId,
    });
  }

  async createProfile(data: Prisma.UserProfileCreateInput) {
    return this.prisma.userProfile.create({
      data,
    });
  }

  async updateProfile(userId: string, data: Prisma.UserProfileUpdateInput) {
    return this.prisma.userProfile.update({
      where: { id: userId },
      data,
    });
  }
}
