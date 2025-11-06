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

  async getManyRefunds({ page, limit, ...where }: GetManyRefundsRequest) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalItems, refunds] = await Promise.all([
      this.prismaService.refund.count({
        where,
      }),
      this.prismaService.refund.findMany({
        where,
        skip,
        take,
      }),
    ]);

    return {
      refunds,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
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
