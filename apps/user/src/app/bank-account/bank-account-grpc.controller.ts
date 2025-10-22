import {
  CreateBankAccountRequest,
  GetBankAccountRequest,
  GetBankAccountResponse,
  UpdateBankAccountRequest,
} from '@domain/user';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BankAccountService } from './bank-account.service';

@Controller()
export class BankAccountGrpcController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @GrpcMethod('UserService', 'GetBankAccount')
  getBankAccount(data: GetBankAccountRequest): Promise<GetBankAccountResponse> {
    return this.bankAccountService.getBankAccount(data);
  }

  @GrpcMethod('UserService', 'CreateBankAccount')
  createBankAccount(
    data: CreateBankAccountRequest
  ): Promise<GetBankAccountResponse> {
    return this.bankAccountService.createBankAccount(data);
  }

  @GrpcMethod('UserService', 'UpdateBankAccount')
  updateBankAccount(
    data: UpdateBankAccountRequest
  ): Promise<GetBankAccountResponse> {
    return this.bankAccountService.updateBankAccount(data);
  }
}
