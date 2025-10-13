import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBankAccountByUserId(
    userId: Prisma.BankAccountWhereUniqueInput['userId']
  ) {
    return this.prisma.bankAccount.findUnique({
      where: {
        userId,
      },
    });
  }

  async createBankAccount(data: Prisma.BankAccountUncheckedCreateInput) {
    return this.prisma.bankAccount.create({
      data,
    });
  }

  async updateBankAccount(
    userId: Prisma.BankAccountWhereUniqueInput['userId'],
    data: Prisma.BankAccountUpdateInput
  ) {
    return this.prisma.bankAccount.update({
      where: { userId },
      data,
    });
  }
}
