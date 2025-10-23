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

  async getManyHistories(data: GetManyHistoriesRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;
    const [totalItems, histories] = await Promise.all([
      this.prismaService.bookingHistory.count({
        where: data,
      }),
      this.prismaService.bookingHistory.findMany({
        where: data,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      histories,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
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
