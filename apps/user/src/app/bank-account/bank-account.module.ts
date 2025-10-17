import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { BankAccountGrpcController } from './bank-account-grpc.controller';
import { BankAccountRepository } from './bank-account.repo';
import { BankAccountService } from './bank-account.service';

@Module({
  imports: [PulsarModule],
  providers: [BankAccountService, BankAccountRepository],
  controllers: [BankAccountGrpcController],
})
export class BankAccountModule {}
