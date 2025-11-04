import {
  CreatePaymentRequest,
  GetManyPaymentsRequest,
  GetPaymentRequest,
  PaymentStatusValues,
  UpdateStatusPaymentRequest,
  WebhookPaymentRequest,
} from '@domain/payment';
import { NatsClient } from '@hacmieu-journey/nats';
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
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient
  ) {}

  generatePaymentCode(sequenceNumber: number, type: string): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const prefix = type.slice(0, 2).toUpperCase();

    return `${prefix}${year}${month}${day}${sequenceNumber
      .toString()
      .padStart(10, '0')}`;
  }

  async getManyPayments({ page, limit, ...where }: GetManyPaymentsRequest) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalItems, payments] = await Promise.all([
      this.prismaService.payment.count({
        where,
      }),
      this.prismaService.payment.findMany({
        where,
        skip,
        take,
      }),
    ]);

    return {
      payments,
      page,
      limit,
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
    return await this.prismaService.$transaction(async (tx) => {
      // Tạo payment với sequenceNumber tự động tăng
      const payment = await tx.payment.create({
        data,
      });

      // Generate payment code
      const paymentCode = this.generatePaymentCode(
        payment.sequenceNumber,
        payment.type
      );

      // Update payment code
      await tx.payment.update({
        where: { id: payment.id },
        data: { paymentCode },
      });
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
      const paymentCode = data.code ? String(data.code) : String(data.content);
      const payment = await tx.payment.findUnique({
        where: {
          paymentCode,
        },
      });
      if (!payment) {
        throw PaymentNotFoundException;
      }
      const { amount, bookingId, rentalId } = payment;
      if (amount !== data.transferAmount) {
        throw AmountPriceMismatchException;
      }

      const eventData = {
        id: bookingId || rentalId,
      };

      await Promise.all([
        tx.payment.update({
          where: {
            paymentCode,
          },
          data: {
            status: PaymentStatusValues.PAID,
          },
        }),
        bookingId
          ? this.natsClient.publish('journey.events.booking-paid', eventData)
          : this.natsClient.publish('journey.events.rental-paid', eventData),
      ]);
    });

    return result;
  }
}
