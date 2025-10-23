import {
  CreateCheckInOutRequest,
  GetCheckInOutRequest,
  GetManyCheckInOutsRequest,
  VerifyCheckInOutRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckInOutRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getManyCheckInOuts(data: GetManyCheckInOutsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;
    const [totalItems, checkInOuts] = await Promise.all([
      this.prismaService.checkInOut.count({
        where: data,
      }),
      this.prismaService.checkInOut.findMany({
        where: data,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      checkInOuts: checkInOuts.map((checkInOut) => ({
        ...checkInOut,
        latitude: checkInOut.latitude.toNumber(),
        longitude: checkInOut.longitude.toNumber(),
      })),
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  async getCheckInOut(data: GetCheckInOutRequest) {
    return this.prismaService.checkInOut
      .findUnique({
        where: {
          id: data.id,
        },
      })
      .then((checkInOut) => {
        if (!checkInOut) return null;

        return {
          ...checkInOut,
          latitude: checkInOut.latitude.toNumber(),
          longitude: checkInOut.longitude.toNumber(),
        };
      });
  }

  async createCheckInOut(data: CreateCheckInOutRequest) {
    return this.prismaService.checkInOut
      .create({
        data,
      })
      .then((checkInOut) => {
        return {
          ...checkInOut,
          latitude: checkInOut.latitude.toNumber(),
          longitude: checkInOut.longitude.toNumber(),
        };
      });
  }

  async verifyCheckInOut(data: VerifyCheckInOutRequest) {
    return this.prismaService.checkInOut
      .update({
        where: { id: data.id },
        data: {
          verified: data.verified,
          verifiedAt: data.verifiedAt,
        },
      })
      .then((checkInOut) => {
        return {
          ...checkInOut,
          latitude: checkInOut.latitude.toNumber(),
          longitude: checkInOut.longitude.toNumber(),
        };
      });
  }
}
