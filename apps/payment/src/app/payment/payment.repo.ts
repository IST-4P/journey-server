import {
  CreatePaymentRequest,
  GetManyPaymentsRequest,
  GetPaymentRequest,
  UpdateStatusPaymentRequest,
} from '@domain/payment';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getManyPayments(data: GetManyPaymentsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const [totalItems, payments] = await Promise.all([
      this.prismaService.payment.count({
        where: data,
      }),
      this.prismaService.payment.findMany({
        where: data,
        skip,
        take,
      }),
    ]);

    return {
      payments,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / take),
    };
  }

  async getPayment(data: GetPaymentRequest) {
    return this.prismaService.payment.findUnique({
      where: data,
    });
  }

  async createPayment(data: CreatePaymentRequest) {
    return this.prismaService.payment.create({
      data,
    });
  }

  async updatePaymentStatus(data: UpdateStatusPaymentRequest) {
    return this.prismaService.payment.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
      },
    });
  }
}
