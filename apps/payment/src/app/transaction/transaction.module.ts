import { Module } from '@nestjs/common';
import { TransactionGrpcController } from './transaction-grpc.controller';
import { TransactionRepository } from './transaction.repo';
import { TransactionService } from './transaction.service';

@Module({
  controllers: [TransactionGrpcController],
  providers: [TransactionRepository, TransactionService],
})
export class TransactionModule {}
