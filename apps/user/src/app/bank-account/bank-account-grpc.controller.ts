import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateBankAccountRequestType,
  GetBankAccountRequestType,
  GetBankAccountResponseType,
  UpdateBankAccountRequestType,
} from './bank-account.model';
import { BankAccountService } from './bank-account.service';

@Controller()
export class BankAccountGrpcController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @GrpcMethod('UserService', 'GetBankAccount')
  getBankAccount(
    data: GetBankAccountRequestType
  ): Promise<GetBankAccountResponseType> {
    return this.bankAccountService.getBankAccount(data);
  }

  @GrpcMethod('UserService', 'CreateBankAccount')
  createBankAccount(
    data: CreateBankAccountRequestType
  ): Promise<GetBankAccountResponseType> {
    return this.bankAccountService.createBankAccount(data);
  }

  @GrpcMethod('UserService', 'UpdateBankAccount')
  updateBankAccount(
    data: UpdateBankAccountRequestType
  ): Promise<GetBankAccountResponseType> {
    return this.bankAccountService.updateBankAccount(data);
  }
}
