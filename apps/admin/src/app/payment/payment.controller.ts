import {
  GetManyPaymentsRequestDTO,
  GetManyRefundsRequestDTO,
  GetManyTransactionsRequestDTO,
  GetPaymentRequestDTO,
  GetRefundRequestDTO,
  GetTransactionRequestDTO,
} from '@domain/payment';
import { Auth, AuthType } from '@hacmieu-journey/nestjs';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  // private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getManyPayments(@Query() query: GetManyPaymentsRequestDTO) {
    return this.paymentService.getManyPayments(query);
  }

  @Get(':id')
  getPayment(@Param() params: Omit<GetPaymentRequestDTO, 'userId'>) {
    return this.paymentService.getPayment(params);
  }
}

@Controller('refund')
export class RefundController {
  // private readonly logger = new Logger(RefundController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getManyRefunds(@Query() query: GetManyRefundsRequestDTO) {
    return this.paymentService.getManyRefunds(query);
  }

  @Get(':id')
  getRefund(@Param() params: Omit<GetRefundRequestDTO, 'userId'>) {
    return this.paymentService.getRefund(params);
  }
}

@Controller('transaction')
export class TransactionController {
  // private readonly logger = new Logger(TransactionController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @Auth([AuthType.Admin])
  getManyTransactions(@Query() query: GetManyTransactionsRequestDTO) {
    return this.paymentService.getManyTransactions(query);
  }

  @Get('information')
  @Auth([AuthType.Admin])
  getInformationTransaction() {
    return this.paymentService.getInformationTransaction({});
  }

  @Get(':id')
  @Auth([AuthType.Admin])
  getTransaction(@Param() params: GetTransactionRequestDTO) {
    return this.paymentService.getTransaction(params);
  }
}
