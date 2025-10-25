import {
  CreatePaymentRequest,
  GetManyPaymentsRequest,
  GetPaymentRequest,
  UpdateStatusPaymentRequest,
  WebhookPaymentRequest,
} from '@domain/payment';
import { Injectable } from '@nestjs/common';
import { parse } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import {
  AmountPriceMismatchException,
  PaymentNotFoundException,
  PaymentTransactionExistsException,
} from './payment.error';

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

  async receiver(data: WebhookPaymentRequest) {
    let amountIn = 0;
    let amountOut = 0;
    if (data.transferType === 'in') {
      amountIn = data.transferAmount;
    } else if (data.transferType === 'out') {
      amountOut = data.transferAmount;
    }

    const paymentTransaction =
      await this.prismaService.paymentTransaction.findUnique({
        where: {
          id: data.id,
        },
      });

    if (paymentTransaction) {
      throw PaymentTransactionExistsException;
    }

    const result = await this.prismaService.$transaction(async (tx) => {
      await tx.paymentTransaction.create({
        data: {
          id: data.id,
          gateway: data.gateway,
          transactionDate: parse(
            data.transactionDate,
            'yyyy-MM-dd HH:mm:ss',
            new Date()
          ),
          accountNumber: data.accountNumber,
          subAccount: data.subAccount,
          amountIn,
          amountOut,
          accumulated: data.accumulated,
          code: data.code,
          transactionContent: data.content,
          referenceNumber: data.referenceCode,
          body: data.description,
        },
      });

      // Kiểm tra nội dung chuyển tiền và tổng số tiền có khớp không
      const paymentId = data.code
        ? String(data.code.split('VE')[1])
        : String(data.content?.split('VE')[1]);

      const payment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

      if (!payment) {
        throw PaymentNotFoundException;
      }
      const { amount, userId } = payment;

      if (amount !== data.transferAmount) {
        throw AmountPriceMismatchException;
      }

      await Promise.all([
        tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: 'PAID',
          },
        }),
      ]);
      return {
        paymentId,
        userId,
      };
    });

    return result;
  }
}
