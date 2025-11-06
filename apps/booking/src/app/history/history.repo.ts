import {
  CreateHistoryRequest,
  GetHistoryRequest,
  GetManyHistoriesRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getManyHistories({ page, limit, ...where }: GetManyHistoriesRequest) {
    const skip = (page - 1) * limit;
    const take = limit;
    const [totalItems, histories] = await Promise.all([
      this.prismaService.bookingHistory.count({
        where,
      }),
      this.prismaService.bookingHistory.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      histories,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getHistory(data: GetHistoryRequest) {
    return this.prismaService.bookingHistory.findUnique({
      where: data,
    });
  }

  async createHistory(data: CreateHistoryRequest) {
    return this.prismaService.bookingHistory.create({
      data,
    });
  }
}
