import {
  GetManyTransactionsRequest,
  GetTransactionRequest,
} from '@domain/payment';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/payment';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getManyTransactions({
    page,
    limit,
    ...where
  }: GetManyTransactionsRequest) {
    const skip = (page - 1) * limit;
    const take = limit;

    let query: Prisma.PaymentTransactionWhereInput = {};

    if (where.type === 'IN') {
      query.amountIn = { gt: 0 };
    } else if (where.type === 'OUT') {
      query.amountOut = { gt: 0 };
    }

    if (where.code) {
      query.code = {
        contains: where.code,
        mode: 'insensitive',
      };
    }

    if (where.startDate !== undefined && where.endDate !== undefined) {
      query.transactionDate = {
        gte: where.startDate,
        lte: where.endDate,
      };
    }

    const [totalItems, transactions] = await Promise.all([
      this.prismaService.paymentTransaction.count({
        where: query,
      }),
      this.prismaService.paymentTransaction.findMany({
        where: query,
        skip,
        take,
        select: {
          id: true,
          code: true,
          gateway: true,
          accountNumber: true,
          transactionContent: true,
          amountIn: true,
          amountOut: true,
          transactionDate: true,
        },
      }),
    ]);

    return {
      transactions,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getTransaction(data: GetTransactionRequest) {
    return this.prismaService.paymentTransaction.findFirst({
      where: data,
    });
  }

  async getInformationTransaction() {
    const result = await this.prismaService.paymentTransaction.aggregate({
      _sum: {
        amountIn: true,
        amountOut: true,
      },
      _count: {
        id: true,
      },
    });

    const totalAmountIn = result._sum.amountIn || 0;
    const totalAmountOut = result._sum.amountOut || 0;
    const totalTransactions = result._count.id || 0;
    const difference = totalAmountIn - totalAmountOut;

    return {
      totalAmountIn, // Tổng tiền vào
      totalAmountOut, // Tổng tiền ra
      totalTransactions, // Tổng số giao dịch
      difference, // Chênh lệch (tiền vào - tiền ra)
    };
  }
}
