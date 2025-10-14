import { Injectable } from '@nestjs/common';
import {
  BankAccountAlreadyExistsException,
  BankAccountNotFoundException,
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
    const result = await this.bankAccountRepo.findBankAccountByUserId(
      data.userId
    );

    if (!result) {
      throw BankAccountNotFoundException;
    }
    return result;
  }

  async createBankAccount(data: CreateBankAccountRequestType) {
    const result = await this.bankAccountRepo.findBankAccountByUserId(
      data.userId
    );
    if (result) {
      throw BankAccountAlreadyExistsException;
    }
    return this.bankAccountRepo.createBankAccount(data);
  }

  async updateBankAccount({ userId, ...data }: UpdateBankAccountRequestType) {
    const result = await this.bankAccountRepo.findBankAccountByUserId(userId);
    if (!result) {
      throw BankAccountNotFoundException;
    }
    return this.bankAccountRepo.updateBankAccount(userId, data);
  }
}
