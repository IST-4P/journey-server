import {
  CreateBankAccountRequest,
  GetBankAccountRequest,
  UpdateBankAccountRequest,
} from '@domain/user';
import { Injectable } from '@nestjs/common';
import {
  BankAccountAlreadyExistsException,
  BankAccountNotFoundException,
} from './bank-account.error';
import { BankAccountRepository } from './bank-account.repo';

@Injectable()
export class BankAccountService {
  // private readonly logger = new Logger(BankAccountService.name);

  constructor(private readonly bankAccountRepo: BankAccountRepository) {}

  async getBankAccount(data: GetBankAccountRequest) {
    const result = await this.bankAccountRepo.findBankAccountByUserId(
      data.userId
    );

    if (!result) {
      throw BankAccountNotFoundException;
    }
    return result;
  }

  async createBankAccount(data: CreateBankAccountRequest) {
    const result = await this.bankAccountRepo.findBankAccountByUserId(
      data.userId
    );
    if (result) {
      throw BankAccountAlreadyExistsException;
    }
    return this.bankAccountRepo.createBankAccount(data);
  }

  async updateBankAccount({ userId, ...data }: UpdateBankAccountRequest) {
    const result = await this.bankAccountRepo.findBankAccountByUserId(userId);
    if (!result) {
      throw BankAccountNotFoundException;
    }
    return this.bankAccountRepo.updateBankAccount(userId, data);
  }
}
