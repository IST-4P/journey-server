import { isNotFoundPrismaError } from '@hacmieu-journey/prisma';
import { Injectable } from '@nestjs/common';
import {
  BankAccountNotFoundException,
  UnauthorizedAccessException,
} from './bank-account.error';
import {
  CreateBankAccountRequestType,
  GetBankAccountRequestType,
  UpdateBankAccountRequestType,
} from './bank-account.model';
import { BankAccountRepository } from './bank-account.repo';

@Injectable()
export class BankAccountService {
  // private readonly logger = new Logger(BankAccountService.name);

  constructor(private readonly bankAccountRepo: BankAccountRepository) {}

  async getBankAccount(data: GetBankAccountRequestType) {
    try {
      const result = await this.bankAccountRepo.findBankAccountByUserId(
        data.userId
      );
      return result;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BankAccountNotFoundException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async createBankAccount(data: CreateBankAccountRequestType) {
    return this.bankAccountRepo.createBankAccount(data);
  }

  async updateBankAccount({ userId, ...data }: UpdateBankAccountRequestType) {
    return this.bankAccountRepo.updateBankAccount(userId, data);
  }
}
