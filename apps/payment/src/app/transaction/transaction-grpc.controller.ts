import {
  GetInformationTransactionResponse,
  GetManyTransactionsRequest,
  GetManyTransactionsResponse,
  GetTransactionRequest,
  GetTransactionResponse,
} from '@domain/payment';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TransactionService } from './transaction.service';

@Controller()
export class TransactionGrpcController {
  constructor(private readonly transactionService: TransactionService) {}

  @GrpcMethod('PaymentService', 'GetManyTransactions')
  getManyTransactions(
    data: GetManyTransactionsRequest
  ): Promise<GetManyTransactionsResponse> {
    return this.transactionService.getManyTransactions(data);
  }

  @GrpcMethod('PaymentService', 'GetTransaction')
  getTransaction(data: GetTransactionRequest): Promise<GetTransactionResponse> {
    return this.transactionService.getTransaction(data);
  }

  @GrpcMethod('PaymentService', 'GetInformationTransaction')
  getInformationTransaction(): Promise<GetInformationTransactionResponse> {
    return this.transactionService.getInformationTransaction();
  }
}
