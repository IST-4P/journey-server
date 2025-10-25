import { WebhookPaymentRequestDTO } from '@domain/payment';
import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  // private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('receiver')
  receiver(@Body() data: WebhookPaymentRequestDTO) {
    return this.paymentService.receiver(data);
  }
}
