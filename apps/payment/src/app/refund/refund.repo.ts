import {
  CreateRefundRequest,
  GetManyRefundsRequest,
  GetRefundRequest,
  UpdateRefundStatusRequest,
} from '@domain/payment';
import { NatsClient } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefundRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient
  ) {}

  async getManyRefunds(data: GetManyRefundsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const [totalItems, refunds] = await Promise.all([
      this.prismaService.refund.count({
        where: data,
      }),
      this.prismaService.refund.findMany({
        where: data,
        skip,
        take,
      }),
    ]);

    return {
      refunds,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / take),
    };
  }

  async getRefund(data: GetRefundRequest) {
    return this.prismaService.refund.findUnique({
      where: data,
    });
  }

  async createRefund(data: CreateRefundRequest) {
    return this.prismaService.refund.create({
      data,
    });
  }

  async updateRefundStatus(data: UpdateRefundStatusRequest) {
    return this.prismaService.refund.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
      },
    });
  }
}
