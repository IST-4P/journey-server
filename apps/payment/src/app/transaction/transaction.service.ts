import {
  GetManyTransactionsRequest,
  GetTransactionRequest,
} from '@domain/payment';
import { Injectable } from '@nestjs/common';
import { TransactionNotFoundException } from './transaction.error';
import { TransactionRepository } from './transaction.repo';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}
  async getManyTransactions(data: GetManyTransactionsRequest) {
    const transactions = await this.transactionRepository.getManyTransactions(
      data
    );
    if (transactions.transactions.length === 0) {
      throw TransactionNotFoundException;
    }
    return transactions;
  }

  async getTransaction(data: GetTransactionRequest) {
    const transaction = await this.transactionRepository.getTransaction(data);
    if (!transaction) {
      throw TransactionNotFoundException;
    }
    return transaction;
  }

  async getInformationTransaction() {
    return this.transactionRepository.getInformationTransaction();
  }
}
