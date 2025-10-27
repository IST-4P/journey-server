import { WebhookPaymentRequestDTO } from '@domain/payment';
import { Auth, AuthType } from '@hacmieu-journey/nestjs';
import { Body, Controller, Post } from '@nestjs/common';
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
}
