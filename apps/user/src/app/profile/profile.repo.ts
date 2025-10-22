import { GetAllProfilesRequest } from '@domain/user';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileById(id: Prisma.ProfileWhereUniqueInput['id']) {
    return this.prisma.profile.findUnique({
      where: { id },
      include: {
        driverLicense: true,
        bankAccount: true,
        addresses: true,
      },
    });
  }

  async findAllProfiles(query: GetAllProfilesRequest) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    let where: Prisma.ProfileWhereInput = {};
    if (query.fullName) {
      where.fullName = { contains: query.fullName, mode: 'insensitive' };
    }
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }
    if (query.phone) {
      where.phone = { contains: query.phone, mode: 'insensitive' };
    }
    if (query.role) {
      where.role = query.role;
    }

    const [totalItems, profiles] = await Promise.all([
      this.prisma.profile.count({ where }),
      this.prisma.profile.findMany({
        where,
        include: {
          driverLicense: true,
          bankAccount: true,
          addresses: true,
        },
        skip,
        take,
      }),
    ]);

    return {
      profiles,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    };
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
