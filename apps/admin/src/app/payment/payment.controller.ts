import {
  GetManyPaymentsRequestDTO,
  GetManyRefundsRequestDTO,
  GetPaymentRequestDTO,
  GetRefundRequestDTO,
} from '@domain/payment';
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
