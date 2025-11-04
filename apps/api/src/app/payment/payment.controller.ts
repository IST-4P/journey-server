import {
  GetManyPaymentsRequestDTO,
  GetPaymentRequestDTO,
  WebhookPaymentRequestDTO,
} from '@domain/payment';
import { ActiveUser, Auth, AuthType } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  // private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Auth([AuthType.PaymentAPIKey])
  @Post('receiver')
  receiver(@Body() data: WebhookPaymentRequestDTO) {
    return this.paymentService.receiver(data);
  }

  @Get()
  getManyPayments(
    @Query() query: GetManyPaymentsRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.paymentService.getManyPayments({ ...query, userId });
  }

  @Get(':id')
  getPayment(
    @Param() params: GetPaymentRequestDTO,
    @ActiveUser('userId') userId: string
  ) {
    return this.paymentService.getPayment({ ...params, userId });
  }
}
